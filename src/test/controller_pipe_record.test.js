/* eslint-disable max-len */
import test from 'blue-tape';
import Answer from '~/core/answer';
import pipeRecord from '~/controller/pipe_record';
import Input from '~/core/input';
import { SessionState } from '~/core/session_state';
import TestDatabase from './test_database';

const db = new TestDatabase();
const before = test;
const after = test;

function getSession() {
  return {
    queueIndex: 1,
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
    state: SessionState.RECALL_RESPONSE,
    globalIndex: 0,
  };
}

before('before controller pipe record testing',
        () => db.setup().then(() => db.clean()).then(() => db.loadAllFixtures()));

test('update existing note record', t => {
  const userID = db.getStaticIDs().userFB;

  const mState = {
    timestamp: 1,
    senderID: '2028279607252615',
    userID,
    input: {
      type: Input.Type.CUSTOM,
      data: 'valence',
    },
    subjectName: 'crash-course-biology',
    subjectID: db.createObjectID('f64c57184a4ef7f0357f9cd6'),
    session: getSession(),
    evalCtx: {
      answerQuality: Answer.ok,
      noteDone: true,
    },
  };

  return pipeRecord(mState)
  .then(state => {
    t.ok({}.hasOwnProperty.call(state, 'recordCtx'));
    const recordCtx = state.recordCtx;
    t.ok({}.hasOwnProperty.call(recordCtx, 'factor'));
    t.ok({}.hasOwnProperty.call(recordCtx, 'interval'));
    t.ok({}.hasOwnProperty.call(recordCtx, 'count'));
    t.ok({}.hasOwnProperty.call(recordCtx, 'due'));
    t.ok({}.hasOwnProperty.call(recordCtx, 'lastDone'));
    t.ok({}.hasOwnProperty.call(recordCtx, 'history'));
    t.ok({}.hasOwnProperty.call(recordCtx, 'health'));
  });
});

test('create new note record', t => {
  const userID = db.getStaticIDs().userFB;

  const session = getSession();
  session.queueIndex = 2;

  const mState = {
    timestamp: 1,
    senderID: '2028279607252615',
    userID,
    input: {
      type: Input.Type.CUSTOM,
      data: 3,
    },
    subjectName: 'crash-course-biology',
    subjectID: db.createObjectID('f64c57184a4ef7f0357f9cd6'),
    session,
    evalCtx: {
      answerQuality: Answer.ok,
      noteDone: true,
    },
  };

  return pipeRecord(mState)
  .then(state => {
    t.ok({}.hasOwnProperty.call(state, 'recordCtx'));
    const recordCtx = state.recordCtx;
    t.ok(hasOwnProperty.call(recordCtx, 'factor'));
    t.ok(hasOwnProperty.call(recordCtx, 'interval'));
    t.ok(hasOwnProperty.call(recordCtx, 'count'));
    t.ok(hasOwnProperty.call(recordCtx, 'due'));
    t.ok(hasOwnProperty.call(recordCtx, 'lastDone'));
    t.ok(hasOwnProperty.call(recordCtx, 'history'));
    t.ok(hasOwnProperty.call(recordCtx, 'health'));
  });
});

after('after controller pipe record testing', () => db.close());
