const mongojs = require('mongojs');
const SessionState = require('../core/session').SessionState
const Schema = require('../db/schema');

var SRCore = require('../core/spaced_repetition');

// ******* User *******************************
var testUserFBMessenger = {_id: new mongojs.ObjectID("5716893a8c8aff3221812148"),
                   name: "Homer",
                   email: "homerjsimpson@faketestemail.com",
                   facebookMessageID: "1028279607252642"};
var testUserFBMessenger2 = {_id: new mongojs.ObjectID("6716893a8c8aff3221812148"),
                   name: "Apu",
                   email: "apu@faketestemail.com"};

// ******* Category ***************************
var defaultSubject = {
  _id: new mongojs.ObjectID("f64c57184a4ef7f0357f9cd6"),
  createdAt : new Date(),
  order : 1,
  ctype : "subject",
  ckey : "crash-course-biology",
  weight : 1
};

var defaultUnit = {
  _id : new mongojs.ObjectID("0850e4270c2aadd7ccdc1ca1"),
  createdAt : new Date(),
  order : 1,
  ctype : "unit",
  ckey : "episode-1-carbon",
  parent : [
    new mongojs.ObjectID("f64c57184a4ef7f0357f9cd6")
  ],
  weight : 1
};

var defaultTopic = {
  _id : new mongojs.ObjectID("5e28c07bb4d307d667fe83e8"),
  createdAt : new Date(),
  order : 1,
  ctype : "topic",
  ckey : "basic",
  parent : [
    new mongojs.ObjectID("f64c57184a4ef7f0357f9cd6"),
    new mongojs.ObjectID("0850e4270c2aadd7ccdc1ca1")
  ],
  weight : 1
};

var defaultConcept = {
  _id : new mongojs.ObjectID("7980227254feb46736ca47fd"),
  createdAt : new Date(),
  order : 1,
  ctype : "concept",
  ckey : "carbon-atomic-weight",
  parent : [
    new mongojs.ObjectID("f64c57184a4ef7f0357f9cd6"),
    new mongojs.ObjectID("0850e4270c2aadd7ccdc1ca1"),
    new mongojs.ObjectID("5e28c07bb4d307d667fe83e8")
  ],
  weight : 1,
  globalIndex: 0,
  subjectParent: defaultSubject._id
};

var noteParent = [new mongojs.ObjectID("f64c57184a4ef7f0357f9cd6"),
    new mongojs.ObjectID("0850e4270c2aadd7ccdc1ca1"),
    new mongojs.ObjectID("5e28c07bb4d307d667fe83e8"),
    new mongojs.ObjectID("7980227254feb46736ca47fd")];

var defaultNote = {
  _id : new mongojs.ObjectID("9e16c772556579bd6fc6c222"),
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

var defaultNote2 = {
  _id : new mongojs.ObjectID("987e8177faf2c2f03c974482"),
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

var defaultNote3 = {
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

var defaultNote4 = {
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
var defaultNote3Ids = [];
var defaultNote4Ids = [];

// ******************** StudentSession ******************

var defaultSession = {
  userID: new mongojs.ObjectID("5716893a8c8aff3221812148"),
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

var dueDate = new Date();
var lastDoneDate = new Date(dueDate);
lastDoneDate.setHours(dueDate.getHours() - 1);

var defaultStudentNote = {
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

var defaultStudentNote2 = {
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

function addUsers(db) {
  // console.log("adding users in test database");
  // db.user.insert(testUserFBMessenger);
  // db.user.insert(testUserFBMessenger2);
  var testUser = new Schema.User(testUserFBMessenger);
  return testUser.save().then(() => {
    var testUser2 = new Schema.User(testUserFBMessenger2);
    return testUser2.save();
  });
}

function cloneObjForBulkWrite(note, num) {
  return Array(num).fill().map( () => {
    return { insertOne: {"document": note} };
  });
}

function addNotes(db) {
  db.category.insert(defaultSubject);
  db.category.insert(defaultUnit);
  db.category.insert(defaultTopic);
  db.category.insert(defaultConcept);

  db.category.insert(defaultNote);
  db.category.insert(defaultNote2);

  var defNote3Op = db.category.bulkWrite( cloneObjForBulkWrite(defaultNote3, 10) );
  if(defNote3Op.acknowledged) {
    var ids = defNote3Op.insertedIds;
    defaultNote3Ids = Object.keys(ids).map(key => ids[key]);
  }


  var defNote4Op = db.category.bulkWrite( cloneObjForBulkWrite(defaultNote4, 10) );
  if(defNote4Op.acknowledged) {
    var ids = defNote4Op.insertedIds;
    defaultNote4Ids = Object.keys(ids).map(key => ids[key]);
  }

}

function addSessions(db) {
  db.studentsession.insert(defaultSession);
}

function addStudentNotes(db) {

  function getDefaultStudentNote(note, noteID, dueDate) {
    return {
      userID: testUserFBMessenger._id,
      noteID: noteID,
      noteType: note.type,
      lastDone: lastDoneDate,
      due: dueDate,
      factor: Modules.SRCore.defaultFactor,
      interval: Modules.SRCore.defaultInterval,
      count: 1,
      subjectParent: note.parent[0]
    }
  }

  var minToMillisecFactor = 60000;
  for(var i=0; i<10; i++) {
    var newDueDate = new Date(dueDate.getTime() + (i-5) * minToMillisecFactor);
    var newStudentNote = getDefaultStudentNote(defaultNote3,
                                               defaultNote3Ids[i],
                                               newDueDate);
    db.studentnote.insert(newStudentNote);
  }

  for(var i=0; i<10; i++) {
    var newDueDate = new Date(dueDate.getTime() + (i-5) * minToMillisecFactor);
    var newStudentNote = getDefaultStudentNote(defaultNote4,
                                               defaultNote4Ids[i],
                                               newDueDate);
    db.studentnote.insert(newStudentNote);
  }

}

var Fixture = {

  addAll: function(db) {
    addUsers(db),
    addNotes(db),
    addSessions(db),
    addStudentNotes(db)
  },

  addUsers: addUsers,
  addNotes: addNotes,
  addSessions: addSessions,
  addStudentNotes, addStudentNotes

};

module.exports = Fixture;
