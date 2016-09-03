import test from 'blue-tape';
const before = test;
const after = test;

import TestDatabase from './test_database';
import { getOldMaterial,
         getNewMaterial,
         getNextNotes } from '../core/scheduler';
import DBAssist from '../db/note_assistant';
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
  return getOldMaterial(testUser._id, subject._id, 20)
  .then(nextNotes => {
    t.equal(nextNotes.length, 14);
  });
});

test('schedule new notes', t => getNewMaterial(subject._id, 20, -1)
.then(nextNotes => {
  t.equal(nextNotes.length, 22);
}));

test('schedule combined old and new notes', t => getNextNotes(testUser._id, subject._id, 20, -1)
.then((nextNotes) => {
  let oldNotes = nextNotes[0];
  let newNotes = nextNotes[1];
  t.equal(oldNotes.length + newNotes.length, 36);
}));

after("after scheduler testing", t => db.close());
