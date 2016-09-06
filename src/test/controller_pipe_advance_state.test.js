/* eslint-disable max-len */
import test from 'blue-tape';
import TestDatabase from './test_database';
import Answer from '../core/answer';
import pipeStateTransition from '../controller/pipe_advance_state';
import Input from '../core/input';
import { SessionState } from '../core/session_state';

const db = new TestDatabase();
const before = test;
const after = test;

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

function getAppState(session, evalCtx) {
  return {
    timestamp: 1,
    senderID: '2028279607252615',
    userID: '7716893a8c8aff3221812149',
    input: {
      type: Input.Type.ACCEPT,
      payload: null,
    },
    subjectName: 'crash-course-biology',
    subjectID: db.createObjectID('f64c57184a4ef7f0357f9cd6'),
    session,
    evalCtx,
  };
}

before('before controller pipe record testing',
        () => db.setup().then(() => db.clean()).then(() => db.loadAllFixtures()));

test('test transition from state INIT', t => {
  const appState = getAppState(getSession(0, SessionState.INIT), {
    answerQuality: Answer.ok,
    doneContext: true,
  });
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.INFO);
  t.equal(nextAppState.session.queueIndex, 0);
  t.end();
});

test('test transition from state INFO success', t => {
  const appState = getAppState(getSession(0, SessionState.INFO), {
    answerQuality: Answer.ok,
    doneContext: true,
  });
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.RECALL);
  t.equal(nextAppState.session.queueIndex, 1);
  t.end();
});

test('test transition from state INFO fail', t => {
  const appState = getAppState(getSession(0, SessionState.INFO), {
    answerQuality: Answer.no,
    doneContext: false,
  });
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.INFO);
  t.equal(nextAppState.session.queueIndex, 0);
  t.end();
});

test('test transition from state RECALL success', t => {
  const appState = getAppState(getSession(1, SessionState.RECALL), {
    answerQuality: Answer.ok,
    doneContext: false,
  });
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.RECALL);
  t.equal(nextAppState.session.queueIndex, 1);
  t.end();
});

test('test transition from state RECALL fail', t => {
  const appState = getAppState(getSession(1, SessionState.RECALL), {
    answerQuality: Answer.no,
    doneContext: false,
  });
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.RECALL);
  t.equal(nextAppState.session.queueIndex, 1);
  t.end();
});

test('test transition from state RECALL_RESPONSE success', t => {
  const appState = getAppState(getSession(1, SessionState.RECALL_RESPONSE), {
    answerQuality: Answer.ok,
    doneContext: true,
  });
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.INPUT);
  t.equal(nextAppState.session.queueIndex, 2);
  t.end();
});

test('test transition from state RECALL_RESPONSE fail', t => {
  const appState = getAppState(getSession(1, SessionState.RECALL_RESPONSE), {
    answerQuality: Answer.no,
    doneContext: true,
  });
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.INPUT);
  t.equal(nextAppState.session.queueIndex, 2);
  t.end();
});

test('test transition from state RECALL_RESPONSE fail not done', t => {
  const appState = getAppState(getSession(1, SessionState.RECALL_RESPONSE), {
    answerQuality: Answer.no,
    doneContext: false,
  });
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.RECALL_RESPONSE);
  t.equal(nextAppState.session.queueIndex, 1);
  t.end();
});

test('test transition from state INPUT success', t => {
  const appState = getAppState(getSession(2, SessionState.INPUT), {
    answerQuality: Answer.ok,
    doneContext: true,
  });
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.MULT_CHOICE);
  t.equal(nextAppState.session.queueIndex, 3);
  t.end();
});

test('test transition from state INPUT fail', t => {
  const appState = getAppState(getSession(2, SessionState.INPUT), {
    answerQuality: Answer.no,
    doneContext: true,
  });
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.MULT_CHOICE);
  t.equal(nextAppState.session.queueIndex, 3);
  t.end();
});

test('test transition from state INPUT fail not done', t => {
  const appState = getAppState(getSession(2, SessionState.INPUT), {
    answerQuality: Answer.no,
    doneContext: false,
  });
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.INPUT);
  t.equal(nextAppState.session.queueIndex, 2);
  t.end();
});

test('test transition from MULT_CHOICE success', t => {
  const appState = getAppState(getSession(3, SessionState.MULT_CHOICE), {
    answerQuality: Answer.ok,
    doneContext: true,
  });
  const nextAppState = pipeStateTransition(appState);
  t.notEqual(nextAppState.session.state, SessionState.MULT_CHOICE);
  t.equal(nextAppState.session.queueIndex, 4);
  t.end();
});

test('test transition from MULT_CHOICE fail', t => {
  const appState = getAppState(getSession(3, SessionState.MULT_CHOICE), {
    answerQuality: Answer.no,
    doneContext: true,
  });
  const nextAppState = pipeStateTransition(appState);
  t.notEqual(nextAppState.session.state, SessionState.MULT_CHOICE);
  t.equal(nextAppState.session.queueIndex, 4);
  t.end();
});

test('test transition from MULT_CHOICE fail not done', t => {
  const appState = getAppState(getSession(3, SessionState.MULT_CHOICE), {
    answerQuality: Answer.no,
    doneContext: false,
  });
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.MULT_CHOICE);
  t.equal(nextAppState.session.queueIndex, 3);
  t.end();
});

test('test transition from last note in queue', t => {
  const appState = getAppState(getSession(3, SessionState.MULT_CHOICE), {
    answerQuality: Answer.ok,
    doneContext: true,
  });
  const nextAppState = pipeStateTransition(appState);
  t.equal(nextAppState.session.state, SessionState.DONE_QUEUE);
  t.equal(nextAppState.session.queueIndex, 4);
  t.end();
});


after('after controller pipe record testing', () => db.close());
