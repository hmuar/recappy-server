import test from 'blue-tape';
import TestDatabase from './test_database';
import { getOldMaterial,
         getNewMaterial,
         getNextNotes } from '../core/scheduler';
import DBAssist from '../db/category_assistant';

const before = test;
const after = test;
const db = new TestDatabase();

const SUBJECT_NAME = 'crash-course-biology';
let subject = null;
let testUser = null;

before('before scheduler testing', () => (
  db.setup().then(() => db.clean())
  .then(() => db.loadAllFixtures())
  .then(() => DBAssist.getCategoryByName('subject', SUBJECT_NAME))
  .then(subj => {
    subject = subj;
    return db.getTestUser();
  })
  .then(user => {
    testUser = user;
  })
));

test('schedule old notes based on due date', (t) => (
  getOldMaterial(testUser._id, subject._id, 20)
  .then(nextNotes => {
    t.equal(nextNotes.length, 14);
  })
));

test('schedule new notes', t => getNewMaterial(subject._id, 20, 0)
.then(nextNotes => {
  t.equal(nextNotes.length, 22);
}));

test('schedule combined old and new notes', t => getNextNotes(testUser._id, subject._id, 20, 0)
.then((nextNotes) => {
  const oldNotes = nextNotes[0];
  const newNotes = nextNotes[1];
  t.equal(oldNotes.length + newNotes.length, 36);
}));

after('after scheduler testing', () => db.close());
