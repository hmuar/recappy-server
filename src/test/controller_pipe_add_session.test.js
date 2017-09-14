import test from 'blue-tape';
import TestDatabase from '~/test/test_database';
import pipeAddSession from '~/controller/pipe_add_session';
import TestConst from './test_const';

const before = test;
const after = test;
const db = new TestDatabase();

const SUBJECT_NAME = TestConst.SUBJECT_NAME;

function getAppState(userID, senderID) {
  return {
    timestamp: 1473534613362,
    userID,
    senderID,
    subjectName: SUBJECT_NAME,
    input: { type: 'custom', payload: 'neutrons', },
    subjectID: db.createObjectID('f64c57184a4ef7f0357f9cd6'),
  };
}

before('before controller pipe add session testing', () =>
  db
    .setup()
    .then(() => db.clean())
    .then(() => db.loadAllFixtures())
);

test('test add session when user already has existing session', t => {
  const existingSenderID = '1028279607252642';
  return pipeAddSession(
    getAppState(db.createObjectID('5716893a8c8aff3221812148'), existingSenderID)
  ).then(state => {
    const { session, } = state;
    t.ok(session);
    t.ok(session.createdAt);
    t.ok(session.updatedAt);
    t.ok(session.createdAt.getTime() === session.updatedAt.getTime());
  });
});

test('test add session with no user', t => {
  const existingSenderID = '1028279607252642';
  return pipeAddSession(getAppState(null, existingSenderID)).then(state => t.notOk(state.session));
});

test('test add session when user has no existing session', t => {
  const existingSenderID = '1028279607252642';
  return pipeAddSession(
    getAppState(db.createObjectID('7716893a8c8aff3221812149'), existingSenderID)
  ).then(state => {
    const { session, } = state;
    t.equal(session.noteQueue.length, 22);
    t.ok(session);
    t.ok(session.createdAt);
    t.ok(session.updatedAt);
    t.ok(session.createdAt.getTime() === session.updatedAt.getTime());
  });
});

test('test add session when user has no existing session with empty startingNotes', t => {
  const existingSenderID = '1028279607252642';
  return pipeAddSession(
    getAppState(db.createObjectID('8716893a8c8aff3221812149'), existingSenderID),
    []
  ).then(state => {
    const { session, } = state;
    t.equal(session.noteQueue.length, 0);
    t.ok(session);
    t.ok(session.createdAt);
    t.ok(session.updatedAt);
    t.ok(session.createdAt.getTime() === session.updatedAt.getTime());
  });
});

after('after controller pipe add session testing', () => db.close());
