/* eslint-disable max-len */
import test from 'blue-tape';
import Input from '~/core/input';
import { SessionState } from '~/core/session_state';
import pipeAdjustQueue from '~/controller/pipe_adjust_queue';
import Answer from '~/core/answer';
import { EvalStatus } from '~/core/eval';
import { insertEval, successEval } from '~/controller/pipe_eval';
import { MAX_NOTES_IN_QUEUE } from '~/core/scheduler';
import TestDatabase from './test_database';
import TestConst from './test_const';

const before = test;
const after = test;
const db = new TestDatabase();

const SUBJECT_NAME = TestConst.SUBJECT_NAME;

function getSession(queueIndex = 0, state, queueLength = 3) {
  const noteQueue = [
    {
      _id: db.createObjectID('9e16c772556579bd6fc6c222'),
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
      parent: [],
    },
    {
      _id: db.createObjectID('987e8177faf2c2f03c974482'),
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
      parent: [],
    },
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
      parent: [],
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
        }
      ],
      label: '',
    }
  ];

  if (queueLength > 3) {
    const numExtraNotes = queueLength - 3;
    for (let i = 0; i < numExtraNotes; i++) {
      noteQueue.push({ _id: 'a dummy note', });
    }
  }

  return {
    queueIndex,
    noteQueue,
    state,
    globalIndex: 0,
  };
}

function getAppState(session, evalCtx) {
  return insertEval(
    {
      timestamp: 1,
      senderID: '2028279607252615',
      userID: '7716893a8c8aff3221812149',
      subjectName: SUBJECT_NAME,
      subjectID: db.createObjectID('f64c57184a4ef7f0357f9cd6'),
      session,
    },
    evalCtx
  );
}

before('before controller pipe adjust queue testing', () =>
  db.setup().then(() => db.clean()).then(() => db.loadAllFixtures()));

test('adjust queue - low answer quality', t => {
  const appState = getAppState(getSession(2, SessionState.MULT_CHOICE), successEval(Answer.min));
  const startQueueLength = appState.session.noteQueue.length;
  const adjustState = pipeAdjustQueue(appState);
  const endAdjustQueueLength = adjustState.session.noteQueue.length;
  t.equal(startQueueLength, 3);
  t.equal(endAdjustQueueLength, 4);
  t.end();
});

// this should NOT make changes to queue since answer quality is high
test('adjust queue - high answer quality', t => {
  const appState = getAppState(getSession(2, SessionState.MULT_CHOICE), successEval(Answer.max));
  const startQueueLength = appState.session.noteQueue.length;
  const adjustState = pipeAdjustQueue(appState);
  const endAdjustQueueLength = adjustState.session.noteQueue.length;
  t.equal(startQueueLength, 3);
  t.equal(endAdjustQueueLength, 3);
  t.end();
});

// this should NOT make changes to queue since already reached max queue limit
test('adjust queue - max note queue length, low answer quality', t => {
  const appState = getAppState(
    getSession(2, SessionState.MULT_CHOICE, MAX_NOTES_IN_QUEUE),
    successEval(Answer.min)
  );
  const startQueueLength = appState.session.noteQueue.length;
  const adjustState = pipeAdjustQueue(appState);
  const endAdjustQueueLength = adjustState.session.noteQueue.length;
  t.equal(startQueueLength, MAX_NOTES_IN_QUEUE);
  t.equal(endAdjustQueueLength, MAX_NOTES_IN_QUEUE + 1);
  t.end();
});

test('adjust queue - show paths first choice', t => {
  const appState = {
    ...getAppState(
      getSession(2, SessionState.SHOW_PATHS, MAX_NOTES_IN_QUEUE),
      successEval(Answer.max, {
        display: 'polar bonds?',
        catName: 'polar-covalent-bond',
        catId: '2980227254feb46732ca491e',
      })
    ),
    input: {
      type: Input.Type.PATH,
      payload: '0',
    },
  };
  const startQueueLength = appState.session.noteQueue.length;
  return pipeAdjustQueue(appState).then(adjustState => {
    const endAdjustQueueLength = adjustState.session.noteQueue.length;
    t.equal(startQueueLength, MAX_NOTES_IN_QUEUE);
    t.equal(endAdjustQueueLength, MAX_NOTES_IN_QUEUE + 10);
  });
});

after('after controller pipe adjust queue testing', () => db.close());
