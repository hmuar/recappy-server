import test from 'blue-tape';
import TestDatabase from './test_database';
import pipeAddSession from '../controller/pipe_add_session';

const before = test;
const after = test;
const db = new TestDatabase();

const SUBJECT_NAME = 'crash-course-biology';

function getAppState(userID, senderID) {
  return {
    timestamp: 1473534613362,
    userID,
    senderID,
    subjectName: SUBJECT_NAME,
    input: { type: 'custom', payload: 'neutrons' },
    subjectID: db.createObjectID('f64c57184a4ef7f0357f9cd6'),
  };
}

before('before controller pipe add session testing', () => (
  db.setup().then(() => db.clean()).then(() => db.loadAllFixtures())));

test('test add session when user already has existing session', t => {
  const existingSenderID = '1028279607252642';
  return pipeAddSession(
    getAppState(db.createObjectID('5716893a8c8aff3221812148'),
    existingSenderID)).then((state) => {
      t.ok(state.session);
    });
});

test('test add session with no user', t => {
  const existingSenderID = '1028279607252642';
  return pipeAddSession(
    getAppState(null,
    existingSenderID)).then((state) => (
      t.notOk(state.session)
    ));
});

test('test add session when user has no existing session', t => {
  const existingSenderID = '1028279607252642';
  return pipeAddSession(
    getAppState(db.createObjectID('7716893a8c8aff3221812149'),
    existingSenderID)).then((state) => {
      t.ok(state.session);
    });
});

after('after controller pipe record testing', () => db.close());
