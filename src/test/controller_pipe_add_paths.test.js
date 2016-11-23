/* eslint-disable max-len */
import test from 'blue-tape';
import Answer from '~/core/answer';
import pipeAddPaths from '~/controller/pipe_add_paths';
import Input from '~/core/input';
import { SessionState } from '~/core/session_state';
import DBAssist from '~/db/category_assistant';
import TestDatabase from './test_database';

const before = test;
const after = test;
const db = new TestDatabase();

const SUBJECT_NAME = 'crash-course-biology';
let subject = null;
let testUser = null;

const noteAID = db.getStaticIDs().note;
const noteBID = db.getStaticIDs().note2;
const noteCID = db.getStaticIDs().note3;

function getSession(queueIndex, state) {
  return {
    queueIndex,
    noteQueue:
    [
      {
        _id: noteAID,
        type: 'info',
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
      },
      {
        _id: noteBID,
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
          },
        ],
      },
      {
        _id: noteCID,
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
          },
        ],
      },
    ],
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

test('test add paths some existing path in record', t => {
  const appState = getAppState(getSession(0, SessionState.SHOW_PATHS));
  return pipeAddPaths(appState)
  .then(nextAppState => {
    t.ok(nextAppState.paths);
    t.deepEqual(nextAppState.paths, [
      {
        display: 'electron?',
        catName: 'electron-shell',
        catId: '7980227254feb46736ca47fd',
        index: 1,
      },
    ]);
  });
});

test('test add paths no existing paths in record', t => {
  const appState = getAppState(getSession(1, SessionState.SHOW_PATHS));
  return pipeAddPaths(appState)
  .then(nextAppState => {
    t.ok(nextAppState.paths);
    t.deepEqual(nextAppState.paths, [
      {
        display: 'polar bonds?',
        catName: 'polar-covalent-bond',
        catId: '2980227254feb46732ca491e',
        index: 0,
      },
      {
        display: 'electron?',
        catName: 'electron-shell',
        catId: '7980227254feb46736ca47fd',
        index: 1,
      },
    ]);
  });
});

test('test add paths all existing paths in record', t => {
  const appState = getAppState(getSession(2, SessionState.SHOW_PATHS));
  return pipeAddPaths(appState)
  .then(nextAppState => {
    t.ok(nextAppState.paths);
    t.deepEqual(nextAppState.paths, []);
  });
});

test('test add paths wrong state', t => {
  const appState = getAppState(getSession(0, SessionState.RECALL_RESPONSE));
  return pipeAddPaths(appState)
  .then(nextAppState => {
    t.ok(nextAppState.paths);
    t.deepEqual(nextAppState.paths, []);
  });
});

after('after controller pipe record testing', () => db.close());
