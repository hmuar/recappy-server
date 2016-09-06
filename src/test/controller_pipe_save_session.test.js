/* eslint-disable max-len */
import test from 'blue-tape';
import TestDatabase from './test_database';
import Answer from '../core/answer';
import pipeSaveSession from '../controller/pipe_save_session';
import Input from '../core/input';
import { SessionState } from '../core/session_state';
import DBAssist from '../db/category_assistant';
import { getSessionForUserAndSubject } from '../db/session_assistant';

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

before('before controller pipe record testing', () => (
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

test('test pipe save session', t => {
  const appState = getAppState(getSession(0, SessionState.MULT_CHOICE), {
    answerQuality: Answer.ok,
    doneContext: true,
  });
  let oldSession = null;
  return getSessionForUserAndSubject(testUser._id, subject._id)
  .then((session) => {
    oldSession = session;
    return pipeSaveSession(appState);
  })
  .then(nextAppState => {
    t.deepEqual(nextAppState, appState);
    return getSessionForUserAndSubject(testUser._id, subject._id)
    .then((session) => {
      t.notDeepEqual(session, oldSession);
      t.equal(session.state, SessionState.MULT_CHOICE);
      t.equal(session.noteQueue.length, 4);
    });
  });
});

after('after controller pipe record testing', () => db.close());
