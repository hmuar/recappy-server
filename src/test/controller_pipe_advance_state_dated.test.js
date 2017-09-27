/* eslint-disable max-len */
import test from 'blue-tape';
import Answer from '~/core/answer';
import pipeStateTransitionDated from '~/controller/pipe_advance_state_dated';
import Input from '~/core/input';
import { SessionState } from '~/core/session_state';
import DBAssist from '~/db/category_assistant';
// import { TARGET_NUM_NOTES_IN_SESSION } from '~/core/scheduler';
import { invalidEval, successEval } from '~/controller/pipe_eval';
import TestDatabase from './test_database';
import TestConst from './test_const';

const before = test;
const after = test;
const db = new TestDatabase();

const SUBJECT_NAME = TestConst.SUBJECT_NAME;
let subject = null;
let testUser = null;

function getSession(queueIndex, state, globalIndex = 0) {
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
    globalIndex,
    nextGlobalIndex: globalIndex + 1,
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
    })
);

// test('test state transition dated early expire date', t => {
//   const appState = {
//     ...getAppState(getSession(0, SessionState.INIT, -1), successEval(Answer.ok)),
//     expireDate: new Date('08/10/2017'),
//   };
//   return pipeStateTransitionDated(appState).then(ns => {
//     t.equal(ns.session.state, SessionState.INFO);
//     t.equal(ns.session.noteQueue.length, 22);
//   });
// });
//
// test('test state transition dated late expire date', t => {
//   const appState = {
//     ...getAppState(getSession(0, SessionState.INIT), successEval(Answer.ok)),
//     expireDate: new Date('08/12/2017'),
//   };
//   // const nextAppState = pipeStateTransitionDated(appState, new Date('08/10/2017'));
//   return pipeStateTransitionDated(appState).then(ns => {
//     t.equal(ns.session.state, SessionState.RECALL);
//     t.equal(ns.session.noteQueue.length, 10);
//   });
// });

test('test state transition dated early publish date', t => {
  const appState = {
    ...getAppState(getSession(0, SessionState.INIT, -1), successEval(Answer.ok)),
    expireDate: new Date('08/01/2017'),
    publishDate: new Date('08/02/2017'),
  };
  return pipeStateTransitionDated(appState).then(ns => {
    t.equal(ns.session.state, SessionState.RECALL);
    t.equal(ns.session.noteQueue.length, 10);
  });
});

test('test state transition dated late publish date', t => {
  const appState = {
    ...getAppState(getSession(0, SessionState.INIT, -1), successEval(Answer.ok)),
    expireDate: new Date('08/01/2017'),
    publishDate: new Date('08/21/2017'),
  };
  return pipeStateTransitionDated(appState).then(ns => {
    t.equal(ns.session.state, SessionState.INFO);
    t.equal(ns.session.noteQueue.length, 22);
  });
});

after('after controller advance state testing', () => db.close());
