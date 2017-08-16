import test from 'blue-tape';
import {
  getOldMaterial,
  getNewMaterial,
  getNewMaterialWithExpireDate,
  getNextNotes
} from '~/core/scheduler';
import DBAssist from '~/db/category_assistant';
import TestDatabase from './test_database';
import TestConst from './test_const';

const before = test;
const after = test;
const db = new TestDatabase();

const SUBJECT_NAME = TestConst.SUBJECT_NAME;
let subject = null;
let testUser = null;

before('before scheduler testing', () =>
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
    }));

test('schedule old notes based on due date', t =>
  getOldMaterial(testUser._id, subject._id, 20).then(nextNotes => {
    t.equal(nextNotes.length, 14);
  }));

test('schedule new notes', t =>
  getNewMaterial(subject._id, 20, 1).then(nextNotes => {
    t.equal(nextNotes.notes.length, 10);
  }));

test('schedule combined old and new notes', t =>
  getNextNotes(testUser._id, subject._id, 1, 20).then(nextNotes => {
    // const oldNotes = nextNotes[0];
    // const newNotes = nextNotes[1];
    t.equal(nextNotes.notes.length, 24);
  }));

test('schedule new notes based on expireDate early', t =>
  getNewMaterial(subject._id, 20, 0, [], new Date('08/10/2017')).then(nextNotesInfo => {
    const nextNotes = nextNotesInfo.notes;
    console.log(nextNotesInfo.notes.map(n => n.directParent));
    t.equal(nextNotes.length, 22);
  }));

test('schedule new notes based on expireDate late', t =>
  getNewMaterial(subject._id, 20, 0, [], new Date('08/11/2017')).then(nextNotesInfo => {
    const nextNotes = nextNotesInfo.notes;
    t.equal(nextNotes.length, 10);
  }));

after('after scheduler testing', () => db.close());
