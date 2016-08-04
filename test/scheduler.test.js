'use strict';

const test = require('blue-tape');
const before = test;
const after = test;

const TestDatabase = require('./test_database');
const Scheduler = require('../core/scheduler');
const DBAssist = require('../db/db_assistant');
const db = new TestDatabase();

const SUBJECT_NAME = 'crash-course-biology';
let subject = null;
let testUser = null;

before("before scheduler testing", (t) => {
  return db.setup().then(() => db.clean())
  .then(() => db.loadAllFixtures())
  .then(() => {
    return DBAssist.getCategoryByName('subject', SUBJECT_NAME);
  }).then(subj => {
    subject = subj;
    return db.getTestUser();
  })
  .then(user => testUser = user);
});

test('schedule old notes based on due date', (t) => {
  return Scheduler.getOldMaterial(testUser._id, subject._id, 20)
  .then(nextNotes => {
    t.equal(nextNotes.length, 12);
  });
});

test('schedule new notes', function(t) {
  return Scheduler.getNewMaterial(subject._id, 20, -1)
  .then(nextNotes => {
    t.equal(nextNotes.length, 22);
  });
});

test('schedule combined old and new notes', function(t) {
  return Scheduler.getNextNotes(testUser._id, subject._id, 20, -1)
  .then((nextNotes) => {
    let oldNotes = nextNotes[0];
    let newNotes = nextNotes[1];
    t.equal(oldNotes.length + newNotes.length, 34);
  });
});

after("after scheduler testing", function(t) {
  return db.close();
});
