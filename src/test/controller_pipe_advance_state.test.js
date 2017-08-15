/* eslint-disable max-len */
import test from 'blue-tape';
import Answer from '~/core/answer';
import pipeStateTransition from '~/controller/pipe_advance_state';
import Input from '~/core/input';
import { SessionState } from '~/core/session_state';
import DBAssist from '~/db/category_assistant';
// import { TARGET_NUM_NOTES_IN_SESSION } from '~/core/scheduler';
import { invalidEval, successEval } from '~/controller/pipe_eval';
import { targetNumNotesInSession } from '~/core/hyperparam';
import TestDatabase from './test_database';
import TestConst from './test_const';

const before = test;
const after = test;
const db = new TestDatabase();

const SUBJECT_NAME = TestConst.SUBJECT_NAME;
let subject = null;
let testUser = null;

function getSession(queueIndex, state) {
  return {
    queueIndex,
    startSessionTime: new Date(),
    noteQueue: [
      {
        _id: db.createObjectID('9e16c772556579bd6fc6c222'),
        type: 'info',
      },
      {
        _id: db.createObjectID('987e8177faf2c2f03c974482'),
        type: 'recall',
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
      },
      {
        _id: db.createObjectID('987e8177faf2c2f03c974482'),
        type: 'input',
        paths: ['fake path input'],
      },
      {
        _id: db.createObjectID('ff7cbfb397fb2794827739ad'),
        type: 'choice',
      }
    ],
    state,
    globalIndex: 0,
    nextGlobalIndex: 1,
  };
}

// function successEval(answerQuality) {
//   return {
//     answerQuality,
//     status: EvalStatus.SUCCESS,
//   };
// }

// function invalidEval() {
//   return {
//     answerQuality: null,
//     status: EvalStatus.INVALID,
//   };
// }

function getAppState(session, evalCtx) {
  return {
    timestamp: 1,
    senderID: '2028279607252615',
    userID: testUser._id,
    input: {
      type: Input.Type.ACCEPT,
      payload: null,
    },
    subjectName: SUBJECT_NAME,
    subjectID: subject._id,
    session,
    evalCtx,
  };
}

before('before controller advance state testing', () =>
  db
    .setup()
    .then(() => db.clean())
    .then(() => db.loadAllFixtures())
    .then(() => DBAssist.getCategoryByName('subject', SUBJECT_NAME))
    .then(subj => {
      subject = subj;
      return db.getTestUser();
    })
    .then(user => {
      testUser = user;
    }));

test('test transition from state INIT', t => {
  const appState = getAppState(getSession(0, SessionState.INIT), successEval(Answer.ok));
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.INFO);
  t.equal(nextAppState.session.queueIndex, 0);
  t.end();
});

test('test transition from state INFO success', t => {
  const appState = getAppState(getSession(0, SessionState.INFO), successEval(Answer.ok));
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.RECALL);
  t.equal(nextAppState.session.queueIndex, 1);
  t.end();
});

test('test transition from state INFO invalid', t => {
  const appState = getAppState(getSession(0, SessionState.INFO), invalidEval());
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.INFO);
  t.equal(nextAppState.session.queueIndex, 0);
  t.end();
});

test('test transition from state RECALL success', t => {
  const appState = getAppState(getSession(1, SessionState.RECALL), successEval(Answer.ok));
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.RECALL_RESPONSE);
  t.equal(nextAppState.session.queueIndex, 1);
  t.end();
});

test('test transition from state RECALL invalid', t => {
  const appState = getAppState(getSession(1, SessionState.RECALL), invalidEval());
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.RECALL);
  t.equal(nextAppState.session.queueIndex, 1);
  t.end();
});

test('test transition from state RECALL_RESPONSE success', t => {
  const appState = getAppState(
    getSession(1, SessionState.RECALL_RESPONSE),
    successEval(Answer.yes)
  );
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.INPUT);
  t.equal(nextAppState.session.queueIndex, 2);
  t.end();
});

test('test transition from state RECALL_RESPONSE fail', t => {
  const appState = getAppState(getSession(1, SessionState.RECALL_RESPONSE), successEval(Answer.no));
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.INPUT);
  t.equal(nextAppState.session.queueIndex, 2);
  t.end();
});

test('test transition from state RECALL_RESPONSE invalid', t => {
  const appState = getAppState(getSession(1, SessionState.RECALL_RESPONSE), invalidEval());
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.RECALL_RESPONSE);
  t.equal(nextAppState.session.queueIndex, 1);
  t.end();
});

test('test transition from state INPUT success', t => {
  const appState = getAppState(getSession(2, SessionState.INPUT), successEval(Answer.ok));
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.MULT_CHOICE);
  t.equal(nextAppState.session.queueIndex, 3);
  t.end();
});

test('test transition from state INPUT fail', t => {
  const appState = getAppState(getSession(2, SessionState.INPUT), successEval(Answer.no));
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.MULT_CHOICE);
  t.equal(nextAppState.session.queueIndex, 3);
  t.end();
});

test('test transition from state INPUT invalid', t => {
  const appState = getAppState(getSession(2, SessionState.INPUT), invalidEval());
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.INPUT);
  t.equal(nextAppState.session.queueIndex, 2);
  t.end();
});

test('test transition from MULT_CHOICE success', t => {
  const appState = getAppState(getSession(3, SessionState.MULT_CHOICE), successEval(Answer.ok));
  const nextAppState = pipeStateTransition(appState);
  t.notEqual(nextAppState.session.state, SessionState.MULT_CHOICE);
  t.equal(nextAppState.session.queueIndex, 4);
  t.end();
});

test('test transition from MULT_CHOICE fail', t => {
  const appState = getAppState(getSession(3, SessionState.MULT_CHOICE), successEval(Answer.no));
  const nextAppState = pipeStateTransition(appState);
  t.notEqual(nextAppState.session.state, SessionState.MULT_CHOICE);
  t.equal(nextAppState.session.queueIndex, 4);
  t.end();
});

test('test transition from MULT_CHOICE invalid', t => {
  const appState = getAppState(getSession(3, SessionState.MULT_CHOICE), invalidEval());
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.MULT_CHOICE);
  t.equal(nextAppState.session.queueIndex, 3);
  t.end();
});

test('test transition from SHOW_PATHS success', t => {
  const appState = getAppState(
    getSession(1, SessionState.SHOW_PATHS),
    successEval(Answer.max, {
      display: 'polar bonds?',
      catName: 'polar-covalent-bond',
      catId: '2980227254feb46732ca491e',
    })
  );
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.INPUT);
  t.equal(nextAppState.session.queueIndex, 2);
  t.end();
});

test('test transition from last note in queue', t => {
  const appState = getAppState(getSession(3, SessionState.MULT_CHOICE), successEval(Answer.ok));
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.DONE_QUEUE);
  t.equal(nextAppState.session.queueIndex, 4);
  t.end();
});

test('test transition from done queue failure, not enough waited hours', t => {
  const appState = getAppState(
    getSession(4, SessionState.DONE_QUEUE),
    successEval(Answer.min, { cutoffDate: new Date(), remainingWaitHours: 0, })
  );
  return pipeStateTransition(appState).then(ns => {
    t.ok(ns.session.state);
    t.equal(ns.session.state, SessionState.DONE_QUEUE);
    t.equal(ns.session.noteQueue.length, 4);
  });
});

test('test transition from done queue success, enough waited hours', t => {
  const appState = getAppState(
    getSession(4, SessionState.DONE_QUEUE),
    successEval(Answer.ok, { cutoffDate: new Date(), remainingWaitHours: 0, })
  );
  return pipeStateTransition(appState).then(ns => {
    t.ok(ns.session.state);
    t.notEqual(ns.session.state, SessionState.DONE_QUEUE);
    t.equal(ns.session.noteQueue.length, targetNumNotesInSession);
    t.equal(ns.session.queueIndex, 0);
    t.equal(ns.session.globalIndex, 1);
  });
});

after('after controller advance state testing', () => db.close());
