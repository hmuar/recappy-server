
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

  // let halfNumNotes = numNotes / 2;
  // let oldNotesNum = Math.ceil(halfNumNotes);
  let oldNotesNum = Math.ceil(numNotes);

  let oldNotes = Scheduler.getOldMaterial(subject, oldNotesNum, userID);

  let newNotesNum = numNotes - oldNotes.length;
  let newNotes = [];

  if(newNotesNum > 0) {
    newNotes = Scheduler.getNewMaterial(subject, newNotesNum, userID, lastGlobalIndex);
  } else {
    console.log("Not enough room for new notes, only using old notes");
  }

  // let notes = oldNotes.concat(newNotes);
  return [oldNotes, newNotes];
}

// getAllNotes: function(subject) {
//   if(!subject) {
//     return [];
//   }
//   let units = DBHelper.getUnitsInOrder(subject);
//   let allNotes = []
//   for(let unitInd = 0; unitInd < units.length; unitInd++) {
//     let unit = units[unitInd];
//     let topics = DBHelper.getTopicsInOrder(subject,
//                                   unit);
//     for(let topicInd = 0; topicInd < topics.length; topicInd++) {
//       let topic = topics[topicInd];
//       let concepts = DBHelper.getConceptsInOrder(subject,
//                                         unit,
//                                         topic);
//       for(let conceptInd = 0; conceptInd < concepts.length; conceptInd++) {
//         let concept = concepts[conceptInd];
//         let notes = DBHelper.getNotesInOrder(subject,
//                         unit,
//                         topic,
//                         concept);
//         allNotes.push.apply(allNotes, notes);
//       }
//     }
//   }
//   return allNotes;
// },
}

function getOldMaterial(subject, numNotes, userID) {
  if(!subject || numNotes <= 0 || !userID) {
    return [];
  }

  // dont query info notes
  let dueNotes = StudentNote.find({"userID": userID, "subjectParent": subject._id, "due": {$lte: new Date()}, "noteType": {$ne: "info"}}, {fields: {_id: 0, noteID: 1}, limit: numNotes});
  let noteIDs = dueNotes.fetch().map(function(item, index) {
    return item.noteID;
  });
  // return oldArr.map(function(item,index){
  //     item.full_name = [item.first_name,item.last_name].join(" ");
  //     return item;
  // });

  return Category.find({"_id": {"$in": noteIDs}}).fetch();
}

function getNewMaterial(subject, numNotes, userID, lastGlobalIndex) {
  if(!subject || numNotes <= 0 || !userID) {
    return [];
  }

  let nextConcept = Category.findOne({ctype: "concept", globalIndex: lastGlobalIndex + 1, subjectParent: subject._id});
  if(!nextConcept) {
    console.log("Could not find next concept, returning 0 new notes");
    return [];
  }

  let notes = Category.find({ctype: "note", directParent: nextConcept._id}, {sort: {order: 1}}).fetch();
  return notes;
}

Scheduler = {
  getNextNotes: getNextNotes,
  getOldMaterial: getOldMaterial,
  getNewMaterial: getNewMaterial
};

module.exports = Scheduler;
