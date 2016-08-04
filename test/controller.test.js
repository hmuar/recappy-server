'use strict';

const test = require('blue-tape');
const before = test;
const after = test;
const AdapterFB = require('../adapter/fbmessenger/fbmessenger');
const TestDatabase = require('./test_database');

const Immut = require('immutable');
const db = new TestDatabase();

const cMod = require('../controller/controller');
let Controller = new cMod(AdapterFB);

before("before controller testing", function(t) {
  return db.setup().then(() => db.clean()).then(() => db.loadAllFixtures());
});

test("register message with existing session", function(t) {
  // `msg` = {
  //   timestamp  : ""
  //   senderID   : "",
  //   userID     : ObjectID,
  //   text       : "",
  //   action     : ""
  // }

  let msg = Immut.Map({
    timestamp: 1,
    senderID: "1028279607252642",
    userID: null,
    text: "hello",
    action: null,
    subjectName: 'crash-course-biology'
  });

  Controller.registerMsg(msg).then((rMsg) => {
    t.ok(rMsg.get('session'));
    t.end();
  }).catch((error) => {
    console.error(error);
    t.fail("could not register message");
    t.end();
  });

});

// senderID doesn't have an existing session in test database
// so this should go through process of session creation
test("register message for new session", function(t) {
  let msg = Immut.Map({
    timestamp: 1,
    senderID: "1028279607252642",
    userID: null,
    text: "hello",
    action: null,
    subjectName: 'cool-new-physics'
  });

  Controller.registerMsg(msg).then((rMsg) => {
    t.ok(rMsg.get('session'));
    t.end();
  }).catch((error) => {
    console.error(error);
    t.fail("could not register message");
    t.end();
  });

});

after("after account testing", function(t) {
  return db.close();
});
