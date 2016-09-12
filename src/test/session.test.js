import test from 'blue-tape';
import { getSessionForUserAndSubject,
         createSession } from '~/db/session_assistant';
import TestDatabase from './test_database';

const before = test;
const after = test;
const db = new TestDatabase();

const staticID = db.getStaticIDs();
staticID.newSubject = db.createObjectID('764c57184a4ef7f0357f9cd6');
// {
//   userFB: testUserFBMessenger._id,
//   userFB2: testUserFBMessenger2._id,
//   subject: defaultSubject._id,
//   note: defaultNote._id,
//   note2: defaultNote2._id,
//   newSubject: new ID
// }

before('before session testing',
  () => db.setup().then(() => db.clean()).then(() => db.loadAllFixtures()));

test('find study session for test student',
  t => getSessionForUserAndSubject(staticID.userFB,
                                    staticID.subject)
  .then((session) => t.ok(session)));

test('dont find study session for fake student',
      t => getSessionForUserAndSubject(
                              db.createObjectID('7716893a8c8aff3221812147'),
                              staticID.subject)
  .then((session) => t.equal(session, null)));

test('dont find session for fake subject',
      t => getSessionForUserAndSubject(
                             staticID.userFB,
                             staticID.newSubject)
  .then((session) => t.equal(session, null)));

test('create study session',
      t => getSessionForUserAndSubject(staticID.userFB2,
                                        staticID.subject)
  .then((session) => t.equal(session, null))
  .then(() => (
    createSession(staticID.userFB2,
                 staticID.subject,
                 staticID.note,
                 0,
                 [staticID.note, staticID.note2],
                 0)
  ))
  .then(() => (
    getSessionForUserAndSubject(staticID.userFB2,
                                staticID.subject)
    .then((session) => t.ok(session))
  )));

test('should append new subject to user session',
  t => getSessionForUserAndSubject(staticID.userFB,
                                    staticID.subject)
  .then((session) => {
    t.ok(session);
    return getSessionForUserAndSubject(staticID.userFB,
                                        staticID.newSubject);
  }).then((session) => {
    t.equal(session, null);
    return createSession(staticID.userFB,
                         staticID.newSubject,
                         staticID.note,
                         0,
                         [staticID.note],
                         0);
  }).then(() => (
    getSessionForUserAndSubject(staticID.userFB,
                                staticID.newSubject)
  ))
  .then((sessionNewSubj) => {
    t.ok(sessionNewSubj);
    return getSessionForUserAndSubject(staticID.userFB,
                                      staticID.subject);
  })
  .then((sessionOldSubj) => {
    t.ok(sessionOldSubj);
  }));

after('after session testing', () => db.close());
