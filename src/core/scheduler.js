import { targetNumNotesInSession, maxNotesInQueue } from '~/core/hyperparam';
import { QueueStatus } from '~/core/session_state';
import { NoteRecord, Category, Note } from '~/db/collection';
import { log } from '~/logger';
import _ from 'lodash';

export const TARGET_NUM_NOTES_IN_SESSION = targetNumNotesInSession;
export const MAX_NOTES_IN_QUEUE = maxNotesInQueue;
export const MAX_GLOBAL_INDEX = 1000000;

// Grab old notes user has already seen that are now
// due according to note's due date.
export function getOldMaterial(userID, subjectID, numNotes, dueDate) {
  if (!subjectID || numNotes <= 0 || !userID) {
    return Promise.resolve([]);
  }

  const dateCutoff = dueDate || new Date();
  const dueMap = {};

  // dont query info notes
  return NoteRecord.find({
    userID,
    subjectParent: subjectID,
    due: { $lte: dateCutoff, },
    noteType: { $ne: 'info', },
  })
    .select({ _id: 0, noteID: 1, due: 1, })
    .limit(numNotes)
    .then(dueNotes =>
      dueNotes.map(item => {
        // create map of noteID to due date so it can be ordered later
        dueMap[item.noteID.toString()] = item.due;
        // map each note to its noteID
        return item.noteID;
      }))
    .then(noteIDs => Note.find({ _id: { $in: noteIDs, }, }))
    .then(notes =>
      notes.map(note => {
        const noteIDString = note._id.toString();
        note.dueDate = dueMap[noteIDString]; // eslint-disable-line no-param-reassign
        note.queueStatus = QueueStatus.OLD; // eslint-disable-line no-param-reassign
        return note;
      }))
    .then(notes =>
      _.sortBy(notes, note => {
        const noteIDString = note._id.toString();
        if ({}.hasOwnProperty.call(dueMap, noteIDString)) {
          return dueMap[noteIDString];
        }
        return 0;
      }));
}

// Grab new notes user has never seen that are next in line.
// What is next in line is determined by what *concept* is next, based
// on given lastGlobalIndex. Note lastGlobalIndex is actually
// globalIndex of the next concept that should be introduced to user.
// Get all notes associated with this concept.
// If result contains no new notes, nextGlobalIndex is set to remain at
// current global index. Otherwise, it is incremented.
// return {
//   notes: [],
//   nextGlobalIndex,
// }
export function getNewMaterial(
  subjectID,
  numNotes,
  globalIndex = 0,
  prevNotes = [],
  // expiration date for concepts (especially for news subject)
  expireDate = null
) {
  if (!subjectID || numNotes <= 0) {
    return Promise.resolve({
      notes: [],
      globalIndex,
      nextGlobalIndex: globalIndex,
    });
  }

  const conceptQuery = expireDate
    ? {
      ctype: 'concept',
      subjectParent: subjectID,
      globalIndex: { $gte: globalIndex, },
        // pull concepts that don't have expire dates.
        // if concept has expire date field, check against given expire date
      $or: [{ expireDate: { $gte: expireDate, }, }, { expireDate: { $exists: false, }, }],
    }
    : {
      ctype: 'concept',
      subjectParent: subjectID,
      globalIndex: { $gte: globalIndex, },
    };

  return Category.findOne(conceptQuery).sort({ globalIndex: 1, }).then(nextConcept => {
    if (!nextConcept) {
      log(`Could not find next concept with index ${globalIndex}, returning 0 new notes`);
      return Promise.resolve({
        notes: prevNotes,
        globalIndex,
        nextGlobalIndex: globalIndex,
      });
    }

    const curGlobalIndex = nextConcept.globalIndex;

    return Note.find({ directParent: nextConcept._id, }).sort('order').then(notes => {
      const taggedNotes = notes.map(note => {
        note.queueStatus = QueueStatus.NEW; // eslint-disable-line no-param-reassign
        return note;
      });
      const mergedNotes = [...prevNotes, ...taggedNotes];
      // terminate and return results
      // if (mergedNotes.length >= numNotes || globalIndex >= MAX_GLOBAL_INDEX) {
      // if (mergedNotes.length >= numNotes) {
      // log(`Got enough notes, returning ${mergedNotes.length} notes`);
      return Promise.resolve({
        notes: mergedNotes,
        // successfully added all new notes from concept associated
        // with current global index, so increment globalIndex
        globalIndex: curGlobalIndex,
        nextGlobalIndex: curGlobalIndex + 1,
      });
      // }

      // recursively get more new material
      // return getNewMaterial(subjectID, numNotes, curGlobalIndex + 1, mergedNotes);
    });
  });
}

export function getNextNotes(
  userID,
  subjectID,
  globalIndex = 0,
  numNotes = TARGET_NUM_NOTES_IN_SESSION,
  dueDate = null,
  expireDate = null
) {
  if (numNotes <= 0) {
    return Promise.resolve({ notes: [], globalIndex, nextGlobalIndex: globalIndex, });
  }

  const oldNotesNum = Math.ceil(numNotes);
  let result = [];

  return getOldMaterial(userID, subjectID, oldNotesNum, dueDate)
    .then(oldNotes => {
      result = [...result, ...oldNotes];
      const newNotesNum = numNotes - oldNotes.length;
      return getNewMaterial(subjectID, newNotesNum, globalIndex, [], expireDate);
    })
    .then(newNotesInfo => {
      result = [...newNotesInfo.notes, ...result];
      // remove duplicate notes that were in both old and new lists
      const uniqResult = _.uniqBy(result, elem => elem._id.toString());
      return {
        notes: uniqResult,
        globalIndex,
        nextGlobalIndex: newNotesInfo.nextGlobalIndex,
      };
    });
}

export function getStartingNotes(subjectID, numNotes, expireDate = null) {
  return getNewMaterial(subjectID, numNotes, 0, [], expireDate);
}
