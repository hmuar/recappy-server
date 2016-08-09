'use strict';

const test = require('blue-tape');
const before = test;
const after = test;

const TestDatabase = require('./test_database');
const DBAssist = require('../db/note_assistant');
const db = new TestDatabase();

before("before db assistant testing", function(t) {
  return db.setup().then(() => db.clean()).then(() => db.loadAllFixtures());
});

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

test("get category by name", function(t) {
  return DBAssist.getCategoryByName("subject", "crash-course-biology")
  .then((cat) => {
    t.ok(cat);
    t.equal(cat._id.toString(), "f64c57184a4ef7f0357f9cd6");
    return DBAssist.getCategoryByName("unit", "episode-1-carbon");
  }).then((cat) => {
    t.ok(cat);
    t.equal(cat._id.toString(), "0850e4270c2aadd7ccdc1ca1");
  });
});

// test("get parent query", function(t) {
//   let tObj = {_id: 1, id: "garbage", name: "stan", subject: "bio"}
//   let tObj2 = {_id: 5, ID: "garbage", last_name: "goodspeed", order: 3}
//   let tObj3 = {_id: 93, _ids: "garbage", first_name: "hank", done: true}
//
//   let query = DBAssist.getParentQuery([tObj, tObj2, tObj3]);
//   t.deepEqual([{parent: [1, 5, 93]}], query);
//   t.end();
// });

test("get parent query with id", function(t) {
  let query = DBAssist.getParentQueryWithId([1, 5, 93]);
  t.deepEqual(query, [{parent: [1, 5, 93]}]);
  t.end();
});

test("get category by id", function(t) {
  return DBAssist.getCategoryById(
              db.createObjectID("5e28c07bb4d307d667fe83e8"))
    .then((cat) => {
      t.ok(cat);
      t.equal(cat._id.toString(), "5e28c07bb4d307d667fe83e8");
    });
});

test("get units in order", function(t) {
  return DBAssist.getUnitsInOrder(
                    db.createObjectID("f64c57184a4ef7f0357f9cd6"))
    .then((units) => {
      t.ok(units);
    });
});

test("get topics in order", function(t) {
  return DBAssist.getTopicsInOrder(
                    db.createObjectID("f64c57184a4ef7f0357f9cd6"),
                    db.createObjectID("0850e4270c2aadd7ccdc1ca1"))
    .then((topics) => {
      t.ok(topics);
    });
});

test("get concepts in order", function(t) {
  return DBAssist.getConceptsInOrder(
                    db.createObjectID("f64c57184a4ef7f0357f9cd6"),
                    db.createObjectID("0850e4270c2aadd7ccdc1ca1"),
                    db.createObjectID("5e28c07bb4d307d667fe83e8"))
    .then((concepts) => {
      t.ok(concepts);
    });
});

test("get notes in order", function(t) {
  return DBAssist.getNotesInOrder(
                    db.createObjectID("f64c57184a4ef7f0357f9cd6"),
                    db.createObjectID("0850e4270c2aadd7ccdc1ca1"),
                    db.createObjectID("5e28c07bb4d307d667fe83e8"),
                    db.createObjectID("7980227254feb46736ca47fd"))
    .then((notes) => {
      t.ok(notes);
    });
});

after("after account testing", function(t) {
  return db.close();
});
