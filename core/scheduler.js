const Collection = require('../db/collection');
const StudentNote = Collection.StudentNote;
const Category = Collection.Category;

// Grab old notes user has already seen that are now
// due according to note's due date.
function getOldMaterial(subject, numNotes, userID) {
  if(!subject || numNotes <= 0 || !userID) {
    return Promise.resolve([]);
  }

  // dont query info notes
  return StudentNote.find({"userID": userID,
                          "subjectParent": subject._id,
                          "due": {$lte: new Date()},
                          "noteType": {$ne: "info"}})
                          .select({_id: 0, noteID: 1})
                          .limit(numNotes)
    .then(dueNotes => {
      // map each note to its noteID
      return dueNotes.map(function(item, index) {
        return item.noteID;
      });
    }).then(noteIDs => {
      return Category.find({_id: {$in: noteIDs}});
    });
}

// Grab new notes user has never seen that are next in line.
// What is next in line is determined by what *concept* is next, based
// on given lastGlobalIndex. Note lastGlobalIndex is actually
// globalIndex of the next concept that should be introduced to user.
// Get all notes associated with this concept.
function getNewMaterial(subject, numNotes, userID, lastGlobalIndex) {
  if(!subject || numNotes <= 0 || !userID) {
    return Promise.resolve([]);
  }

  return Category.findOne({ctype: "concept",
                           globalIndex: lastGlobalIndex + 1,
                           subjectParent: subject._id})
    .then(nextConcept => {
      if(!nextConcept) {
        console.log("Could not find next concept, returning 0 new notes");
        return [];
      }
      return Category.find({ctype: "note",
                            directParent: nextConcept._id})
                            .sort("order");
    });
}

// Get combination of old and new notes
// return [oldNotes, newNotes]
// TODO: Detect if two questions have same c-key and only ask one
// TODO: factor in weighting of concepts
function getNextNotes(subject, numNotes, userID, lastGlobalIndex) {
  if(numNotes <= 0){
    return Promise.resolve([]);
  }

  let oldNotesNum = Math.ceil(numNotes);
  let result = []


  return Scheduler.getOldMaterial(subject,
                                  oldNotesNum,
                                  userID)
    .then((oldNotes) => {
      result.push(oldNotes);
      let newNotesNum = numNotes - oldNotes.length;
      if(newNotesNum > 0) {
        return Scheduler.getNewMaterial(subject, newNotesNum, userID, lastGlobalIndex);
      }
      else {
        return [];
      }
    }).then((newNotes) => {
      result.push(newNotes);
      return result;
    });
}


Scheduler = {
  getNextNotes: getNextNotes,
  getOldMaterial: getOldMaterial,
  getNewMaterial: getNewMaterial
};

module.exports = Scheduler;
