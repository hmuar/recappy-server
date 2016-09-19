/* eslint-disable max-len */
import test from 'blue-tape';
import { SessionState } from '~/core/session_state';
import Answer from '~/core/answer';
import Input from '~/core/input';
import pipeStudentModel from '~/controller/pipe_student_model';
import { StudentModel } from '~/db/collection';
import TestDatabase from './test_database';

const before = test;
const after = test;
const db = new TestDatabase();

function getSession(queueIndex, state) {
  return {
    queueIndex,
    noteQueue:
     [{ _id: db.createObjectID('9e16c772556579bd6fc6c222'),
         createdAt: '2016-08-06T00:33:36.808Z',
         ctype: 'note',
         order: 1,
         type: 'info',
         weight: 1,
         level: 1,
         display: '<p>Carbon has 6 protons and 6 neutrons in its nucleus. This makes it a relatively small, flexible atom so it is very useful. This helps make carbon fundamental to life. Without carbon all human, plant, and animal life would not be possible. We are all <strong>carbon-based</strong> lifeforms.</p>',
         extra: '',
         extra_media: '',
         ckey: 'proton-neutron-electron',
         displayRaw: 'Carbon has 6 protons and 6 neutrons in its nucleus. This makes it a relatively small, flexible atom so it is very useful. This helps make carbon fundamental to life. Without carbon all human, plant, and animal life would not be possible. We are all carbon-based lifeforms.',
         globalIndex: 0,
         directParent: db.createObjectID('7980227254feb46736ca47fd'),
         __v: 0,
         parent: [
           db.createObjectID('f64c57184a4ef7f0357f9cd6'),
           db.createObjectID('0850e4270c2aadd7ccdc1ca1'),
           db.createObjectID('5e28c07bb4d307d667fe83e8'),
           db.createObjectID('7980227254feb46736ca47fd'),
         ] },
       { _id: db.createObjectID('987e8177faf2c2f03c974482'),
         createdAt: '2016-08-06T00:33:36.808Z',
         ctype: 'note',
         order: 2,
         type: 'recall',
         weight: 0.5,
         level: 0.2,
         display: '<p>How many protons and neutrons does carbon have?</p>',
         extra: '',
         extra_media: '',
         ckey: 'q-protons-neutrons',
         displayRaw: 'How many protons and neutrons does carbon have?',
         globalIndex: 1,
         directParent: db.createObjectID('7980227254feb46736ca47fd'),
         __v: 0,
         parent: [
           db.createObjectID('f64c57184a4ef7f0357f9cd6'),
           db.createObjectID('0850e4270c2aadd7ccdc1ca1'),
           db.createObjectID('5e28c07bb4d307d667fe83e8'),
           db.createObjectID('7980227254feb46736ca47fd'),
         ] },
     {
       _id: db.createObjectID('ff7cbfb397fb2794827739ad'),
       createdAt: '2016-04-15T00:36:56.879Z',
       ctype: 'note',
       order: 9,
       type: 'choice',
       weight: 1,
       level: 0.8,
       display: '<p>A polar covalent bond leads to what?</p>',
       extra: '',
       extra_media: '',
       parent: [
         db.createObjectID('f64c57184a4ef7f0357f9cd6'),
         db.createObjectID('0850e4270c2aadd7ccdc1ca1'),
         db.createObjectID('5e28c07bb4d307d667fe83e8'),
         db.createObjectID('7980227254feb46736ca47fd'),
       ],
       ckey: 'polar-covalent-bond',
       displayRaw: 'A polar covalent bond leads to what?',
       choice1: 'equal sharing of electrons',
       choice2: 'sharing of electrons between molecules',
       choice3: 'slightly charged sides of a molecule',
       choice4: 'no sharing of charges',
       choice5: 'sharing of neutrons between molecules',
       answer: 3,
       hidden: 'Polar covalent bonds have unequal sharing of electrons, so some sides of molecules will be more negatively charged and some more positively charged.',
       globalIndex: 65,
       subjectParent: db.createObjectID('f64c57184a4ef7f0357f9cd6'),
       directParent: db.createObjectID('f9e515b670e5b8de9210872e'),
       phrase: {
         pre: [],
       },
       label: '' },
       ],
    state,
    globalIndex: 0,
  };
}

function getAppState(userID, queueIndex, state) {
  return {
    timestamp: 1,
    senderID: '2028279607252615',
    userID,
    input: {
      type: Input.Type.CUSTOM,
      data: '3',
    },
    subjectName: 'crash-course-biology',
    subjectID: db.createObjectID('f64c57184a4ef7f0357f9cd6'),
    session: getSession(queueIndex, state),
    evalCtx: {
      answerQuality: Answer.ok,
      noteDone: true,
    },
  };
}

before('before knowledge model testing',
  () => db.setup()
  .then(() => db.clean())
  .then(() => db.loadStudentModelFixtures()));

test('Handle note that does not exist', t => {
  const userID = db.getStaticIDs().userFB;
  const appState = getAppState(userID, 2, SessionState.MULT_CHOICE);
  const catID = db.createObjectID('ff7cbfb397fb2794827739ad');

  return StudentModel.findOne({ userID, catID }).then((model) => {
    t.notOk(model);
    return pipeStudentModel(appState)
      .then(() => StudentModel.findOne({ userID, catID }))
      .then((newModel) => {
        t.ok(newModel);
        t.ok(Math.abs(newModel.weight - 0.128) < Number.EPSILON);
      });
  });
});

test('Handle note that already exists', t => {
  const { userFB: userID, note: catID } = db.getStaticIDs();
  const appState = getAppState(userID, 0, SessionState.INFO);

  return StudentModel.findOne({ userID, catID })
    .then((model) => {
      t.ok(model);
      t.equal(model.weight, 0.5);
      return pipeStudentModel(appState)
      .then(() => StudentModel.findOne({ userID, catID }))
      .then((newModel) => {
        t.ok(newModel);
        t.ok(Math.abs(newModel.weight - 0.7) < Number.EPSILON);
      });
    });
});

after('after account testing', () => db.close());
