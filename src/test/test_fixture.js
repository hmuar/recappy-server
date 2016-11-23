/* eslint-disable max-len */

import { SessionState } from '~/core/session_state';
import { ObjectID,
         User,
         Note,
         Category,
         StudentSession,
         NoteRecord,
         StudentModel } from '~/db/collection';
import SRCore from '~/core/spaced_repetition';

// ******* User *******************************
const testUserFBMessenger = {
  _id: ObjectID('5716893a8c8aff3221812148'),
  name: 'Homer',
  email: 'homerjsimpson@faketestemail.com',
  facebookMessageID: '1028279607252642',
};
const testUserFBMessenger2 = {
  _id: ObjectID('6716893a8c8aff3221812148'),
  name: 'Apu',
  email: 'apu@faketestemail.com',
  facebookMessageID: '1028279607252619',
};
const testUserFBMessenger3 = {
  _id: ObjectID('7716893a8c8aff3221812149'),
  name: 'Wiggum',
  email: 'wiggum@faketestemail.com',
  facebookMessageID: '2028279607252615',
};
const testUser = {
  name: 'John Doe',
  email: 'john@faketestemail.com',
};

// ******* Category ***************************
const defaultSubject = {
  _id: ObjectID('f64c57184a4ef7f0357f9cd6'),
  createdAt: new Date(),
  order: 1,
  ctype: 'subject',
  ckey: 'crash-course-biology',
  weight: 1,
};

const subjectA = {
  _id: ObjectID('e64c57184a4ef7f0357f9cd9'),
  createdAt: new Date(),
  order: 1,
  ctype: 'subject',
  ckey: 'cool-new-physics',
  weight: 1,
};

const defaultUnit = {
  _id: ObjectID('0850e4270c2aadd7ccdc1ca1'),
  createdAt: new Date(),
  order: 1,
  ctype: 'unit',
  ckey: 'episode-1-carbon',
  parent: [
    ObjectID('f64c57184a4ef7f0357f9cd6'),
  ],
  weight: 1,
};

const defaultTopic = {
  _id: ObjectID('5e28c07bb4d307d667fe83e8'),
  createdAt: new Date(),
  order: 1,
  ctype: 'topic',
  ckey: 'basic',
  parent: [
    ObjectID('f64c57184a4ef7f0357f9cd6'),
    ObjectID('0850e4270c2aadd7ccdc1ca1'),
  ],
  weight: 1,
};

const defaultConcept = {
  _id: ObjectID('7980227254feb46736ca47fd'),
  createdAt: new Date(),
  order: 1,
  ctype: 'concept',
  ckey: 'carbon-atomic-weight',
  parent: [
    ObjectID('f64c57184a4ef7f0357f9cd6'),
    ObjectID('0850e4270c2aadd7ccdc1ca1'),
    ObjectID('5e28c07bb4d307d667fe83e8'),
  ],
  weight: 1,
  globalIndex: 0,
  subjectParent: defaultSubject._id,
};

const defaultConcept2 = {
  _id: ObjectID('2980227254feb46732ca491e'),
  createdAt: new Date(),
  order: 2,
  ctype: 'concept',
  ckey: 'molecule',
  parent: [
    ObjectID('f64c57184a4ef7f0357f9cd6'),
    ObjectID('0850e4270c2aadd7ccdc1ca1'),
    ObjectID('5e28c07bb4d307d667fe83e8'),
  ],
  weight: 1,
  globalIndex: 1,
  subjectParent: defaultSubject._id,
};

const noteParent = [ObjectID('f64c57184a4ef7f0357f9cd6'),
    ObjectID('0850e4270c2aadd7ccdc1ca1'),
    ObjectID('5e28c07bb4d307d667fe83e8'),
    ObjectID('7980227254feb46736ca47fd')];

const noteParentOtherConcept = [ObjectID('f64c57184a4ef7f0357f9cd6'),
    ObjectID('0850e4270c2aadd7ccdc1ca1'),
    ObjectID('5e28c07bb4d307d667fe83e8'),
    ObjectID('2980227254feb46732ca491e')];

const noteA = {
  _id: ObjectID('9e16c772556579bd6fc6c222'),
  createdAt: new Date(),
  ctype: 'note',
  order: 1,
  type: 'info',
  weight: 1,
  level: 1,
  display: '<p>Carbon has 6 protons and 6 neutrons in its nucleus. This makes it a relatively small, flexible atom so it is very useful. This helps make carbon fundamental to life. Without carbon all human, plant, and animal life would not be possible. We are all <strong>carbon-based</strong> lifeforms.</p>',
  extra: '',
  extra_media: '',
  parent: noteParent,
  ckey: 'proton-neutron-electron',
  displayRaw: 'Carbon has 6 protons and 6 neutrons in its nucleus. This makes it a relatively small, flexible atom so it is very useful. This helps make carbon fundamental to life. Without carbon all human, plant, and animal life would not be possible. We are all carbon-based lifeforms.',
  globalIndex: 0,
  directParent: noteParent[noteParent.length - 1],
  paths: [
    {
      display: 'polar bonds?',
      catName: 'polar-covalent-bond',
      catId: '2980227254feb46732ca491e',
    },
    {
      display: 'electron?',
      catName: 'electron-shell',
      catId: '7980227254feb46736ca47fd',
    },
  ],
};

const noteB = {
  _id: ObjectID('987e8177faf2c2f03c974482'),
  createdAt: new Date(),
  ctype: 'note',
  order: 2,
  type: 'recall',
  weight: 0.5,
  level: 0.2,
  display: '<p>How many protons and neutrons does carbon have?</p>',
  extra: '',
  extra_media: '',
  parent: noteParent,
  ckey: 'q-protons-neutrons',
  displayRaw: 'How many protons and neutrons does carbon have?',
  hidden: '6',
  globalIndex: 1,
  directParent: noteParent[noteParent.length - 1],
  paths: [
    {
      display: 'polar bonds?',
      catName: 'polar-covalent-bond',
      catId: '2980227254feb46732ca491e',
    },
    {
      display: 'electron?',
      catName: 'electron-shell',
      catId: '7980227254feb46736ca47fd',
    },
  ],
};

// Different concept
const noteC = {
  createdAt: new Date(),
  ctype: 'note',
  order: 2,
  type: 'recall',
  weight: 0.5,
  level: 0.2,
  display: '<p>What is a molecule?</p>',
  extra: '',
  extra_media: '',
  parent: noteParentOtherConcept,
  ckey: 'q-molecule',
  displayRaw: 'Multiple atoms stuck together',
  hidden: '6',
  globalIndex: 1,
  directParent: noteParentOtherConcept[noteParent.length - 1],
};

const noteTemplateA = {
  createdAt: new Date(),
  ctype: 'note',
  order: 2,
  type: 'recall',
  weight: 0.5,
  level: 0.2,
  display: '<p>Default note 3 question?</p>',
  extra: '',
  extra_media: '',
  parent: noteParent,
  ckey: 'test-default-3-recall',
  displayRaw: 'How many protons and neutrons does carbon have?',
  hidden: 'default note 3 answer',
  globalIndex: 2,
  directParent: noteParent[noteParent.length - 1],
};

const noteTemplateB = {
  createdAt: new Date(),
  ctype: 'note',
  order: 2,
  type: 'recall',
  weight: 0.5,
  level: 0.2,
  display: '<p>Default note 4 question?</p>',
  extra: '',
  extra_media: '',
  parent: noteParent,
  ckey: 'test-default-4-recall',
  displayRaw: 'How many protons and neutrons does carbon have?',
  hidden: 'default note 4 answer',
  globalIndex: 3,
  directParent: noteParent[noteParent.length - 1],
};

// ******************** StudentSession ******************
const sessionTemplate = {
  userID: ObjectID('5716893a8c8aff3221812148'),
  subjects: {
    f64c57184a4ef7f0357f9cd6: {
      noteID: noteA._id,
      queueIndex: 0,
      noteQueue: [noteA, noteB],
      state: SessionState.RECALL,
      globalIndex: 0,
    },
  },
};

// ******* NoteRecord **************************
// - noteID (MongoID)
// - lastDone (Date)
// - due (Date)
// - factor (float)
// - interval (float)
// - count (int)

const dueDate = new Date();
const lastDoneDate = new Date(dueDate);
lastDoneDate.setHours(dueDate.getHours() - 1);

const defaultNoteRecord = {
  userID: testUserFBMessenger._id,
  noteID: noteA._id,
  noteType: noteTemplateA.type,
  lastDone: lastDoneDate,
  due: dueDate,
  factor: SRCore.defaultFactor,
  interval: SRCore.defaultInterval,
  count: 1,
  subjectParent: noteTemplateA.parent[0],
  pathHistory: [ObjectID('2980227254feb46732ca491e')],
};

const defaultNoteRecord2 = {
  userID: testUserFBMessenger._id,
  noteID: noteB._id,
  noteType: noteTemplateB.type,
  lastDone: lastDoneDate,
  due: dueDate,
  factor: SRCore.defaultFactor,
  interval: SRCore.defaultInterval,
  count: 1,
  subjectParent: noteTemplateB.parent[0],
};

const defaultNoteRecord3 = {
  userID: testUserFBMessenger._id,
  noteID: ObjectID('9980227254feb46732ca491a'),
  noteType: noteTemplateB.type,
  lastDone: lastDoneDate,
  due: dueDate,
  factor: SRCore.defaultFactor,
  interval: SRCore.defaultInterval,
  count: 1,
  subjectParent: noteTemplateB.parent[0],
  pathHistory: [ObjectID('2980227254feb46732ca491e'),
                ObjectID('7980227254feb46736ca47fd')],
};

function addUsers() {
  return (new User(testUserFBMessenger)).save()
  .then(() => (new User(testUserFBMessenger2)).save())
  .then(() => (new User(testUserFBMessenger3)).save())
  .then(() => (new User(testUser)).save());
}

function cloneNote(noteData, num) {
  return Array(num).fill().map(() => (
    new Note(noteData)
  ));
}

// return two lists of ids of cloned notes
function addNotes() {
  const defNoteIds = [];
  // return (new Category(defaultSubject)).save();
  const subj = new Category(defaultSubject);
  return subj.save()
    .then(() => (new Category(subjectA)).save())
    .then(() => (new Category(defaultUnit)).save())
    .then(() => (new Category(defaultTopic)).save())
    .then(() => (new Category(defaultConcept)).save())
    .then(() => (new Category(defaultConcept2)).save())
    .then(() => (new Note(noteA)).save())
    .then(() => (new Note(noteB)).save())
    .then(() => Note.create(cloneNote(noteC, 10)))
    .then(() => {
      const noteTempAList = cloneNote(noteTemplateA, 10);
      return Note.create(noteTempAList).then(() => {
        const noteTempAListIds = noteTempAList.map(defNote => defNote._id);
        defNoteIds.push(noteTempAListIds);

        const defNote4List = cloneNote(noteTemplateB, 10);
        return Note.create(defNote4List).then(() => {
          const defNote4ListIds = defNote4List.map(defNote => defNote._id);
          defNoteIds.push(defNote4ListIds);
          return defNoteIds;
        });
      });
    });
}

function addSessions() {
  const session = new StudentSession(sessionTemplate);
  return session.save();
}

// defNoteIds should be an array with two elems.
// Each elem is a list of ids
function addNoteRecords(defNoteIds) {
  function getDefNoteRecordData(note, noteID, due) {
    return {
      userID: testUserFBMessenger._id,
      noteID,
      noteType: note.type,
      lastDone: lastDoneDate,
      due,
      factor: SRCore.defaultFactor,
      interval: SRCore.defaultInterval,
      count: 1,
      subjectParent: note.parent[0],
    };
  }

  const minToMillisecFactor = 60000;

  const defRec = new NoteRecord(defaultNoteRecord);
  const defRec2 = new NoteRecord(defaultNoteRecord2);
  const defRec3 = new NoteRecord(defaultNoteRecord3);

  let pChain = defRec.save().then(() => defRec2.save()).then(() => defRec3.save());

  const noteTemplateAIds = defNoteIds[0];

  // half will be due in the past, half in the future
  for (let i = 0; i < 10; i++) {
    // add 20 miliseconds to make sure when i=0, the date will be in future
    const newDueDate = new Date(dueDate.getTime() + (i - 5) * minToMillisecFactor + 20); //eslint-disable-line
    const newNoteRecord = getDefNoteRecordData(noteTemplateA,
                                               noteTemplateAIds[i],
                                               newDueDate);
    const snote = new NoteRecord(newNoteRecord);
    if (!pChain) {
      pChain = snote.save();
    } else {
      pChain = pChain.then(() => snote.save());
    }
  }

  const noteTemplateBIds = defNoteIds[1];

  // half will be due in the past, half in the future
  for (let i = 0; i < 10; i++) {
    const newDueDate = new Date(dueDate.getTime() + (i - 5) * minToMillisecFactor); //eslint-disable-line
    const newNoteRecord = getDefNoteRecordData(noteTemplateB,
                                               noteTemplateBIds[i],
                                               newDueDate);
    const snote = new NoteRecord(newNoteRecord);
    if (!pChain) {
      pChain = snote.save();
    } else {
      pChain = pChain.then(() => snote.save());
    }
  }

  return pChain;
}

function addStudentModel() {
  const noteData = {
    userID: testUserFBMessenger._id,
    catID: noteA._id,
    weight: 0.5,
    ctype: 'note',
  };
  const conceptData = {
    userID: testUserFBMessenger._id,
    catID: defaultConcept._id,
    weight: 0.1,
    ctype: 'concept',
  };
  const note = new StudentModel(noteData);
  const concept = new StudentModel(conceptData);

  return note.save(() => concept.save());
}

const Fixture = {

  addAll() {
    return addUsers().then(() => (
      addNotes()
    ))
    .then(defNoteIds => (
      addNoteRecords(defNoteIds)
    ))
    .then(() => (
      addSessions()
    ))
    .then(() => (
      addStudentModel()
    ));
  },

  addUsers,
  addNotes,
  addSessions,
  addNoteRecords,
  addStudentModel,

  getStaticIDs() {
    return {
      userFB: testUserFBMessenger._id,
      userFB2: testUserFBMessenger2._id,
      subject: defaultSubject._id,
      note: noteA._id,
      note2: noteB._id,
      note3: noteC._id,
    };
  },

};

export default Fixture;
