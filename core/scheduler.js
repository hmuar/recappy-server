const Collection = require('../db/collection');
const StudentNote = Collection.StudentNote;
const Category = Collection.Category;

// TODO: Detect if two questions have same c-key and only ask one

/*

Factors:
30% new material
70% old material

New material:
  - grab from database in order based on last seen note id
  - *TODO* factor in weighting of concepts

Old material:
  - grab based on delay and next due date

*/

function getNextNotes(subject, numNotes, userID, lastGlobalIndex) {
  if(numNotes <= 0){
    return [];
  }

  let oldNotesNum = Math.ceil(numNotes);

  return Scheduler.getOldMaterial(subject,
                                  oldNotesNum,
                                  userID)
    .then((oldNotes) => {
      let newNotesNum = numNotes - oldNotes.length;
      if(newNotesNum > 0) {
        return Scheduler.getNewMaterial(subject, newNotesNum, userID, lastGlobalIndex);
      }
      else {
        return [];
      }
    }).then((newNotes) => {
      return [oldNotes, newNotes];
    });
}

function getOldMaterial(subject, numNotes, userID) {
  if(!subject || numNotes <= 0 || !userID) {
    return [];
  }

  // dont query info notes
  return StudentNote.find({"userID": userID,
                          "subjectParent": subject._id,
                          "due": {$lte: new Date()},
                          "noteType": {$ne: "info"}},
                          {fields: {_id: 0, noteID: 1}, limit: numNotes})
    .then((dueNotes) => {
      // map each note to its noteID
      return dueNotes.map(function(item, index) {
        return item.noteID;
      });
    }).then((noteIDs) => {
      return Category.find({"_id": {"$in": noteIDs}});
    });
}

function getNewMaterial(subject, numNotes, userID, lastGlobalIndex) {
  if(!subject || numNotes <= 0 || !userID) {
    return [];
  }

  // let nextConcept = Category.findOne({ctype: "concept", globalIndex: lastGlobalIndex + 1, subjectParent: subject._id});
  return Category.findOne({ctype: "concept",
                           globalIndex: lastGlobalIndex + 1,
                           subjectParent: subject._id})
    .then((nextConcept) => {
      if(!nextConcept) {
        console.log("Could not find next concept, returning 0 new notes");
        return [];
      }
      return Category.find({ctype: "note",
                            directParent: nextConcept._id},
                            {sort: {order: 1}});
    });
}

Scheduler = {
  getNextNotes: getNextNotes,
  getOldMaterial: getOldMaterial,
  getNewMaterial: getNewMaterial
};

module.exports = Scheduler;
