import test from 'blue-tape';
import DBAssist from '~/db/category_assistant';
import TestDatabase from './test_database';
import TestConst from './test_const';

const before = test;
const after = test;
const db = new TestDatabase();

const SUBJECT_NAME = TestConst.SUBJECT_NAME;

before('before db assistant testing', () =>
  db.setup().then(() => db.clean()).then(() => db.loadAllFixtures()));

// test("get parent list", function(t) {
//   let tObj = {_id: 1, id: "garbage", name: "stan", subject: "bio"}
//   let tObj2 = {_id: 5, ID: "garbage", last_name: "goodspeed", order: 3}
//   let tObj3 = {_id: 93, _ids: "garbage", first_name: "hank", done: true}
//
//   let ids = DBAssist.getParentList([tObj, tObj2, tObj3]);
//   t.deepEqual(ids, [1, 5, 93]);
//   t.deepEqual(DBAssist.getParentList([]), []);
//   t.deepEqual(DBAssist.getParentList([null]), [null]);
//   t.deepEqual(DBAssist.getParentList([undefined]), [null]);
//   t.end();
// });

test('get category by name', t =>
  DBAssist.getCategoryByName('subject', SUBJECT_NAME)
    .then(cat => {
      t.ok(cat);
      t.equal(cat._id.toString(), 'f64c57184a4ef7f0357f9cd6');
      return DBAssist.getCategoryByName('unit', 'episode-1-carbon');
    })
    .then(cat => {
      t.ok(cat);
      t.equal(cat._id.toString(), '0850e4270c2aadd7ccdc1ca1');
    }));

// test("get parent query", function(t) {
//   let tObj = {_id: 1, id: "garbage", name: "stan", subject: "bio"}
//   let tObj2 = {_id: 5, ID: "garbage", last_name: "goodspeed", order: 3}
//   let tObj3 = {_id: 93, _ids: "garbage", first_name: "hank", done: true}
//
//   let query = DBAssist.getParentQuery([tObj, tObj2, tObj3]);
//   t.deepEqual([{parent: [1, 5, 93]}], query);
//   t.end();
// });

test('get parent query with id', t => {
  const query = DBAssist.getParentQueryWithId([1, 5, 93]);
  t.deepEqual(query, [{ parent: [1, 5, 93], }]);
  t.end();
});

test('get category by id', t =>
  DBAssist.getCategoryById(db.createObjectID('5e28c07bb4d307d667fe83e8')).then(cat => {
    t.ok(cat);
    t.equal(cat._id.toString(), '5e28c07bb4d307d667fe83e8');
  }));

test('get units in order', t =>
  DBAssist.getUnitsInOrder(db.createObjectID('f64c57184a4ef7f0357f9cd6')).then(units => {
    t.ok(units);
  }));

test('get topics in order', t =>
  DBAssist.getTopicsInOrder(
    db.createObjectID('f64c57184a4ef7f0357f9cd6'),
    db.createObjectID('0850e4270c2aadd7ccdc1ca1')
  ).then(topics => {
    t.ok(topics);
  }));

test('get concepts in order', t =>
  DBAssist.getConceptsInOrder(
    db.createObjectID('f64c57184a4ef7f0357f9cd6'),
    db.createObjectID('0850e4270c2aadd7ccdc1ca1'),
    db.createObjectID('5e28c07bb4d307d667fe83e8')
  ).then(concepts => {
    t.ok(concepts);
  }));

// test('get notes in order', t => DBAssist.getNotesInOrder(
//                   db.createObjectID('f64c57184a4ef7f0357f9cd6'),
//                   db.createObjectID('0850e4270c2aadd7ccdc1ca1'),
//                   db.createObjectID('5e28c07bb4d307d667fe83e8'),
//                   db.createObjectID('7980227254feb46736ca47fd'))
//   .then((notes) => {
//     t.ok(notes);
//   }));

test('get child notes for subject', t =>
  DBAssist.getAllChildNotes(db.createObjectID('f64c57184a4ef7f0357f9cd6')).then(notes => {
    t.ok(notes);
    t.ok(notes.length > 0);
  }));

test('get child notes for topic', t =>
  DBAssist.getAllChildNotes(db.createObjectID('5e28c07bb4d307d667fe83e8')).then(notes => {
    t.ok(notes);
    t.equal(notes.length, 32);
  }));

test('get child notes for concept', t =>
  DBAssist.getAllChildNotes(db.createObjectID('2980227254feb46732ca491e')).then(notes => {
    t.ok(notes);
    t.equal(notes.length, 10);
  }));

after('db assistant testing', () => db.close());
