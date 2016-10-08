import { NoteRecord, Category, Note } from '~/db/collection';
import { log } from '~/logger';
import _ from 'lodash';

export const TARGET_NUM_NOTES_IN_SESSION = 10;

// Grab old notes user has already seen that are now
// due according to note's due date.
export function getOldMaterial(userID, subjectID, numNotes) {
  if (!subjectID || numNotes <= 0 || !userID) {
    return Promise.resolve([]);
  }

  // dont query info notes
  return NoteRecord.find({ userID,
                          subjectParent: subjectID,
                          due: { $lte: new Date() },
                          noteType: { $ne: 'info' } })
    .select({ _id: 0, noteID: 1 })
    .limit(numNotes)
    .then(dueNotes => (
      // map each note to its noteID
      dueNotes.map((item) => item.noteID)))
    .then(noteIDs => Note.find({ _id: { $in: noteIDs } }));
}

// Grab new notes user has never seen that are next in line.
// What is next in line is determined by what *concept* is next, based
// on given lastGlobalIndex. Note lastGlobalIndex is actually
// globalIndex of the next concept that should be introduced to user.
// Get all notes associated with this concept.
export function getNewMaterial(subjectID, numNotes, globalIndex = 0) {
  if (!subjectID || numNotes <= 0) {
    return Promise.resolve([]);
  }

  return Category.findOne({ ctype: 'concept',
                           globalIndex,
                           subjectParent: subjectID })
    .then(nextConcept => {
      if (!nextConcept) {
        log('Could not find next concept, returning 0 new notes');
        return [];
      }
      return Note.find({ directParent: nextConcept._id }).sort('order');
    });
}

// Get combination of old and new notes
// return [oldNotes, newNotes]
// TODO: Detect if two questions have same c-key and only ask one
// TODO: factor in weighting of concepts
export function getNextNotes(userID,
                             subjectID,
                             globalIndex = 0,
                             numNotes = TARGET_NUM_NOTES_IN_SESSION
                             ) {
  if (!numNotes || numNotes <= 0) {
    return Promise.resolve([]);
  }

  const oldNotesNum = Math.ceil(numNotes);
  let result = [];

  return getOldMaterial(userID,
                        subjectID,
                        oldNotesNum)
    .then((oldNotes) => {
      result = [...result, ...oldNotes.map((note) => {
        note.queueStatus = 'old'; // eslint-disable-line no-param-reassign
        return note;
      })];
      // result = [...result, ...oldNotes];
      const newNotesNum = numNotes - oldNotes.length;
      if (newNotesNum > 0) {
        return getNewMaterial(subjectID, newNotesNum, globalIndex);
      }
      return [];
    }).then((newNotes) => {
      result = [...result, ...newNotes.map((note) => {
        note.queueStatus = 'new'; // eslint-disable-line no-param-reassign
        return note;
      })];
      // remove duplicate notes that were in both old and new lists
      const uniqResult = _.uniqBy(result, (elem) => elem._id.toString());
      return uniqResult;
    });
}

export function getStartingNotes(subjectID, numNotes) {
  return getNewMaterial(subjectID, numNotes);
}
