/* eslint-disable max-len */
import test from 'blue-tape';
import TestDatabase from './test_database';
import Answer from '../core/answer';
import pipeStateTransition from '../controller/pipe_advance_state';
import Input from '../core/input';
import { SessionState } from '../core/session_state';
import DBAssist from '../db/category_assistant';
import { EvalStatus } from '../core/eval';

const before = test;
const after = test;
const db = new TestDatabase();

const SUBJECT_NAME = 'crash-course-biology';
let subject = null; // eslint-disable-line
let testUser = null; // eslint-disable-line

function getSession(queueIndex, state) {
  return {
    queueIndex,
    noteQueue:
      [{ _id: db.createObjectID('9e16c772556579bd6fc6c222'),
        type: 'info',
      },
      { _id: db.createObjectID('987e8177faf2c2f03c974482'),
         type: 'recall',
      },
      { _id: db.createObjectID('987e8177faf2c2f03c974482'),
        type: 'input',
      },
      { _id: db.createObjectID('ff7cbfb397fb2794827739ad'),
        type: 'choice',
      }],
    state,
    globalIndex: 0,
  };
}

function validEval(answerQuality) {
  return {
    answerQuality,
    status: EvalStatus.SUCCESS,
  };
}

function invalidEval() {
  return {
    answerQuality: null,
    status: EvalStatus.INVALID,
  };
}

function getAppState(session, evalCtx) {
  return {
    timestamp: 1,
    senderID: '2028279607252615',
    userID: testUser._id,
    input: {
      type: Input.Type.ACCEPT,
      payload: null,
    },
    subjectName: 'crash-course-biology',
    subjectID: subject._id,
    session,
    evalCtx,
  };
}

before('before controller advance state testing', () => (
  db.setup().then(() => db.clean()).then(() => db.loadAllFixtures()))
  .then(() => DBAssist.getCategoryByName('subject', SUBJECT_NAME))
  .then(subj => {
    subject = subj;
    return db.getTestUser();
  })
  .then(user => {
    testUser = user;
  }
));

test('test transition from state INIT', t => {
  const appState = getAppState(getSession(0, SessionState.INIT),
                               validEval(Answer.ok));
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.INFO);
  t.equal(nextAppState.session.queueIndex, 0);
  t.end();
});

test('test transition from state INFO success', t => {
  const appState = getAppState(getSession(0, SessionState.INFO),
                               validEval(Answer.ok));
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.RECALL);
  t.equal(nextAppState.session.queueIndex, 1);
  t.end();
});

test('test transition from state INFO invalid', t => {
  const appState = getAppState(getSession(0, SessionState.INFO),
                               invalidEval());
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.INFO);
  t.equal(nextAppState.session.queueIndex, 0);
  t.end();
});

test('test transition from state RECALL success', t => {
  const appState = getAppState(getSession(1, SessionState.RECALL),
                               validEval(Answer.ok));
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.RECALL_RESPONSE);
  t.equal(nextAppState.session.queueIndex, 1);
  t.end();
});

test('test transition from state RECALL invalid', t => {
  const appState = getAppState(getSession(1, SessionState.RECALL),
                               invalidEval());
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.RECALL);
  t.equal(nextAppState.session.queueIndex, 1);
  t.end();
});

test('test transition from state RECALL_RESPONSE success', t => {
  const appState = getAppState(getSession(1, SessionState.RECALL_RESPONSE),
                               validEval(Answer.yes));
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.INPUT);
  t.equal(nextAppState.session.queueIndex, 2);
  t.end();
});

test('test transition from state RECALL_RESPONSE fail', t => {
  const appState = getAppState(getSession(1, SessionState.RECALL_RESPONSE),
                               validEval(Answer.no));
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.INPUT);
  t.equal(nextAppState.session.queueIndex, 2);
  t.end();
});

test('test transition from state RECALL_RESPONSE invalid', t => {
  const appState = getAppState(getSession(1, SessionState.RECALL_RESPONSE),
                               invalidEval());
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.RECALL_RESPONSE);
  t.equal(nextAppState.session.queueIndex, 1);
  t.end();
});

test('test transition from state INPUT success', t => {
  const appState = getAppState(getSession(2, SessionState.INPUT),
                               validEval(Answer.ok));
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.MULT_CHOICE);
  t.equal(nextAppState.session.queueIndex, 3);
  t.end();
});

test('test transition from state INPUT fail', t => {
  const appState = getAppState(getSession(2, SessionState.INPUT),
                               validEval(Answer.no));
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.MULT_CHOICE);
  t.equal(nextAppState.session.queueIndex, 3);
  t.end();
});

test('test transition from state INPUT invalid', t => {
  const appState = getAppState(getSession(2, SessionState.INPUT),
                               invalidEval());
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.INPUT);
  t.equal(nextAppState.session.queueIndex, 2);
  t.end();
});

test('test transition from MULT_CHOICE success', t => {
  const appState = getAppState(getSession(3, SessionState.MULT_CHOICE),
                               validEval(Answer.ok));
  const nextAppState = pipeStateTransition(appState);
  t.notEqual(nextAppState.session.state, SessionState.MULT_CHOICE);
  t.equal(nextAppState.session.queueIndex, 4);
  t.end();
});

test('test transition from MULT_CHOICE fail', t => {
  const appState = getAppState(getSession(3, SessionState.MULT_CHOICE),
                               validEval(Answer.no));
  const nextAppState = pipeStateTransition(appState);
  t.notEqual(nextAppState.session.state, SessionState.MULT_CHOICE);
  t.equal(nextAppState.session.queueIndex, 4);
  t.end();
});

test('test transition from MULT_CHOICE invalid', t => {
  const appState = getAppState(getSession(3, SessionState.MULT_CHOICE),
                               invalidEval());
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.MULT_CHOICE);
  t.equal(nextAppState.session.queueIndex, 3);
  t.end();
});

test('test transition from last note in queue', t => {
  const appState = getAppState(getSession(3, SessionState.MULT_CHOICE),
                               validEval(Answer.ok));
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.DONE_QUEUE);
  t.equal(nextAppState.session.queueIndex, 4);
  t.end();
});

test('test transition from done queue', t => {
  const appState = getAppState(getSession(4, SessionState.DONE_QUEUE),
                               validEval(Answer.ok));
  return pipeStateTransition(appState)
  .then(ns => {
    t.notEqual(ns.session.state, SessionState.DONE_QUEUE);
    t.equal(ns.session.noteQueue.length, 3);
    t.equal(ns.session.queueIndex, 0);
    t.equal(ns.session.globalIndex, 1);
  });
});

after('after controller pipe record testing', () => db.close());
