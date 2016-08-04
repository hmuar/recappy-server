'use strict';

const Schema = require('../db/collection');
const test = require('blue-tape');
const before = test;
const after = test;

const TestDatabase = require('./test_database');
const StudySession = require('../study/session');
const SessionState = require('../study/session_state').SessionState;
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

before("before session testing", function(t) {
  return db.setup().then(() => db.clean()).then(() => db.loadAllFixtures());
});

test('find study session for test student', function(t) {
  return StudySession.getSessionForUserAndSubject(staticID.userFB,
                                                  staticID.subject)
  .then((session) => t.ok(session));
});

test('dont find study session for fake student', function(t) {
  return StudySession.getSessionForUserAndSubject(
                              db.createObjectID('7716893a8c8aff3221812147'),
                              staticID.subject)
  .then((session) => t.equal(session, null));
});

test('dont find session for fake subject', function(t) {
  return StudySession.getSessionForUserAndSubject(
                                               staticID.userFB,
                                               staticID.newSubject)
  .then((session) => t.equal(session, null));
});

test('create study session', function(t) {

  return StudySession.getSessionForUserAndSubject(staticID.userFB2,
                                                  staticID.subject)
  .then((session) => t.equal(session, null))
  .then(() => {
    return StudySession.createSession(staticID.userFB2,
                               staticID.subject,
                               staticID.note,
                               0,
                               [staticID.note, staticID.note2],
                               0);
  }).then(() => {
    return StudySession.getSessionForUserAndSubject(staticID.userFB2,
                                                    staticID.subject)
    .then((session) => t.ok(session));
  })

});

test('should append new subject to user session', function(t) {

  return StudySession.getSessionForUserAndSubject(staticID.userFB,
                                                  staticID.subject)
  .then((session) => {
    t.ok(session);
    return  StudySession.getSessionForUserAndSubject(
                                                  staticID.userFB,
                                                  staticID.newSubject);
  }).then((session) => {
    t.equal(session, null);
    return StudySession.createSession(staticID.userFB,
                               staticID.newSubject,
                               staticID.note,
                               0,
                               [staticID.note],
                               0);
  }).then(() => {
    return StudySession.getSessionForUserAndSubject(
                                              staticID.userFB,
                                              staticID.newSubject);
  }).then((sessionNewSubj) => {
    t.ok(sessionNewSubj);
    return StudySession.getSessionForUserAndSubject(
                                                  staticID.userFB,
                                                  staticID.subject);
  }).then((sessionOldSubj) => {
    t.ok(sessionOldSubj);
  });
});

after("after session testing", function(t) {
  return db.close();
});
