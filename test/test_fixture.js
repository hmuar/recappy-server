'use strict';
const SessionState = require('../study/session_state').SessionState;
const Collection = require('../db/collection');
const SRCore = require('../core/spaced_repetition');

let ObjectID = Collection.ObjectID;

// ******* User *******************************
let testUserFBMessenger = {
       _id: ObjectID("5716893a8c8aff3221812148"),
       name: "Homer",
       email: "homerjsimpson@faketestemail.com",
       facebookMessageID: "1028279607252642"
     };
let testUserFBMessenger2 = {
       _id: ObjectID("6716893a8c8aff3221812148"),
       name: "Apu",
       email: "apu@faketestemail.com",
       facebookMessageID: "1028279607252619"
     };

let testUser = {
      name: "John Doe",
      email: "john@faketestemail.com"
    };

// ******* Category ***************************
let defaultSubject = {
  _id: ObjectID("f64c57184a4ef7f0357f9cd6"),
  createdAt : new Date(),
  order : 1,
  ctype : "subject",
  ckey : "crash-course-biology",
  weight : 1
};

let defaultUnit = {
  _id : ObjectID("0850e4270c2aadd7ccdc1ca1"),
  createdAt : new Date(),
  order : 1,
  ctype : "unit",
  ckey : "episode-1-carbon",
  parent : [
    ObjectID("f64c57184a4ef7f0357f9cd6")
  ],
  weight : 1
};

let defaultTopic = {
  _id : ObjectID("5e28c07bb4d307d667fe83e8"),
  createdAt : new Date(),
  order : 1,
  ctype : "topic",
  ckey : "basic",
  parent : [
    ObjectID("f64c57184a4ef7f0357f9cd6"),
    ObjectID("0850e4270c2aadd7ccdc1ca1")
  ],
  weight : 1
};

let defaultConcept = {
  _id : ObjectID("7980227254feb46736ca47fd"),
  createdAt : new Date(),
  order : 1,
  ctype : "concept",
  ckey : "carbon-atomic-weight",
  parent : [
    ObjectID("f64c57184a4ef7f0357f9cd6"),
    ObjectID("0850e4270c2aadd7ccdc1ca1"),
    ObjectID("5e28c07bb4d307d667fe83e8")
  ],
  weight : 1
// globalIndex: 0,
  // subjectParent: defaultSubject._id
};

let noteParent = [ObjectID("f64c57184a4ef7f0357f9cd6"),
    ObjectID("0850e4270c2aadd7ccdc1ca1"),
    ObjectID("5e28c07bb4d307d667fe83e8"),
    ObjectID("7980227254feb46736ca47fd")];

let defaultNote = {
  _id : ObjectID("9e16c772556579bd6fc6c222"),
  createdAt : new Date(),
  ctype : "note",
  order : 1,
  type : "info",
  weight : 1,
  level : 1,
  display : "<p>Carbon has 6 protons and 6 neutrons in its nucleus. This makes it a relatively small, flexible atom so it is very useful. This helps make carbon fundamental to life. Without carbon all human, plant, and animal life would not be possible. We are all <strong>carbon-based</strong> lifeforms.</p>",
  extra : "",
  extra_media : "",
  parent : noteParent,
  ckey : "proton-neutron-electron",
  displayRaw : "Carbon has 6 protons and 6 neutrons in its nucleus. This makes it a relatively small, flexible atom so it is very useful. This helps make carbon fundamental to life. Without carbon all human, plant, and animal life would not be possible. We are all carbon-based lifeforms."    ,
  globalIndex: 0,
  directParent: noteParent[noteParent.length - 1]
};

let defaultNote2 = {
  _id : ObjectID("987e8177faf2c2f03c974482"),
  createdAt : new Date(),
  ctype : "note",
  order : 2,
  type : "recall",
  weight : 0.5,
  level : 0.2,
  display : "<p>How many protons and neutrons does carbon have?</p>",
  extra : "",
  extra_media : "",
  parent : noteParent,
  ckey : "q-protons-neutrons",
  displayRaw : "How many protons and neutrons does carbon have?",
  hidden : "6",
  globalIndex: 1,
  directParent: noteParent[noteParent.length - 1]
};

let defaultNote3 = {
  createdAt : new Date(),
  ctype : "note",
  order : 2,
  type : "recall",
  weight : 0.5,
  level : 0.2,
  display : "<p>Default note 3 question?</p>",
  extra : "",
  extra_media : "",
  parent : noteParent,
  ckey : "test-default-3-recall",
  displayRaw : "How many protons and neutrons does carbon have?",
  hidden : "default note 3 answer",
  globalIndex: 2,
  directParent: noteParent[noteParent.length - 1]
};

let defaultNote4 = {
  createdAt : new Date(),
  ctype : "note",
  order : 2,
  type : "recall",
  weight : 0.5,
  level : 0.2,
  display : "<p>Default note 4 question?</p>",
  extra : "",
  extra_media : "",
  parent : noteParent,
  ckey : "test-default-4-recall",
  displayRaw : "How many protons and neutrons does carbon have?",
  hidden : "default note 4 answer",
  globalIndex: 3,
  directParent: noteParent[noteParent.length - 1]
};

// Need to store ids of notes that were cloned and inserted.
// These will be referenced later in studentNotes.
let defaultNote3Ids = [];
let defaultNote4Ids = [];

// ******************** StudentSession ******************

let defaultSession = {
  userID: ObjectID("5716893a8c8aff3221812148"),
  subjects: {
    "f64c57184a4ef7f0357f9cd6": {
      noteID: defaultNote._id,
      queueIndex: 0,
      noteQueue: [defaultNote._id, defaultNote2._id],
      state: SessionState.RECALL,
      globalIndex: 0
    }
  }
};

// ******* StudentNote **************************
// - noteID (MongoID)
// - lastDone (Date)
// - due (Date)
// - factor (float)
// - interval (float)
// - count (int)

let dueDate = new Date();
let lastDoneDate = new Date(dueDate);
lastDoneDate.setHours(dueDate.getHours() - 1);

let defaultStudentNote = {
  userID: testUserFBMessenger._id,
  noteID: defaultNote3._id,
  noteType: defaultNote3.type,
  lastDone: lastDoneDate,
  due: dueDate,
  factor: SRCore.defaultFactor,
  interval: SRCore.defaultInterval,
  count: 1,
  subjectParent: defaultNote3.parent[0]
};

let defaultStudentNote2 = {
  userID: testUserFBMessenger._id,
  noteID: defaultNote4._id,
  noteType: defaultNote4.type,
  lastDone: lastDoneDate,
  due: dueDate,
  factor: SRCore.defaultFactor,
  interval: SRCore.defaultInterval,
  count: 1,
  subjectParent: defaultNote4.parent[0]
};

function addUsers() {
  return (new Collection.User(testUserFBMessenger)).save()
  .then(function(doc) {
    return (new Collection.User(testUserFBMessenger2)).save();
  }).then(function(doc) {
    return (new Collection.User(testUser)).save();
  });
}

function cloneNote(noteData, num) {
  return Array(num).fill().map( () => {
    return (new Collection.Note(noteData));
  });
}

// return two lists of ids of cloned notes
function addNotes() {
  console.log("addNotes....");
  let defNoteIds = [];
  // return (new Collection.Category(defaultSubject)).save();
  let subj = new Collection.Category(defaultSubject);
  return subj.save()
    .then(function(doc) {
      console.log("save unit...");
      return (new Collection.Category(defaultUnit)).save();
    }).then(function(doc) {
      console.log("save topic...");
      return (new Collection.Category(defaultTopic)).save();
    }).then(function(doc) {
      return (new Collection.Category(defaultConcept)).save();
    }).then(() => {
      return (new Collection.Note(defaultNote)).save();
    }).then(() => {
      return (new Collection.Note(defaultNote2)).save();
    }).then(() => {
      let defNote3ListIds = [];
      let defNote3List = cloneNote(defaultNote3, 10);
      return Collection.Note.create(defNote3List).then((docs) => {
        let defNote3ListIds = defNote3List.map(defNote => defNote._id);
        defNoteIds.push(defNote3ListIds);

        let defNote4ListIds = [];
        let defNote4List = cloneNote(defaultNote4, 10);
        return Collection.Note.create(defNote4List).then((docs) => {
          let defNote4ListIds = defNote4List.map(defNote => defNote._id);
          defNoteIds.push(defNote4ListIds);
          return defNoteIds;
        });
      });
    });
}

function addSessions() {
  let session = new Collection.StudentSession(defaultSession);
  return session.save();
}

// defNoteIds should be an array with two elems.
// Each elem is a list of ids
function addStudentNotes(defNoteIds) {

  function getDefStudentNoteData(note, noteID, dueDate) {
    return {
      userID: testUserFBMessenger._id,
      noteID: noteID,
      noteType: note.type,
      lastDone: lastDoneDate,
      due: dueDate,
      factor: SRCore.defaultFactor,
      interval: SRCore.defaultInterval,
      count: 1,
      subjectParent: note.parent[0]
    }
  }

  let minToMillisecFactor = 60000;
  let pChain = null;

  let defaultNote3Ids = defNoteIds[0];

  for(let i=0; i<10; i++) {
    let newDueDate = new Date(dueDate.getTime() + (i-5) * minToMillisecFactor);
    let newStudentNote = getDefStudentNoteData(defaultNote3,
                                               defaultNote3Ids[i],
                                               newDueDate);
    let snote = new Collection.StudentNote(newStudentNote);
    if(!pChain) {
      pChain = snote.save();
    }
    else {
      pChain = pChain.then(() => snote.save());
    }
  }

  let defaultNote4Ids = defNoteIds[0];

  for(let i=0; i<10; i++) {
    let newDueDate = new Date(dueDate.getTime() + (i-5) * minToMillisecFactor);
    let newStudentNote = getDefStudentNoteData(defaultNote4,
                                               defaultNote4Ids[i],
                                               newDueDate);
    let snote = new Collection.StudentNote(newStudentNote);
    if(!pChain) {
      pChain = snote.save();
    }
    else {
      pChain = pChain.then(() => snote.save());
    }
  }

  return pChain;

}

let Fixture = {

  addAll: function() {
    return addUsers().then(() => {
      return addNotes();
    }).then((defNoteIds) => {
      return addStudentNotes(defNoteIds);
    }).then(() => {
      return addSessions();
    });
  },

  addUsers: addUsers,
  addNotes: addNotes,
  addSessions: addSessions,
  addStudentNotes, addStudentNotes,

  getStaticIDs: function() {
    return {
      userFB: testUserFBMessenger._id,
      userFB2: testUserFBMessenger2._id,
      subject: defaultSubject._id,
      note: defaultNote._id,
      note2: defaultNote2._id
    }
  }

};

module.exports = Fixture;
