'use strict';

const test = require('blue-tape');
const before = test;
const after = test;

const TestDatabase = require('./test_database');
const Account = new (require('../account/account'));
const db = new TestDatabase();

before("before account testing", function(t) {
  return db.setup().then(() => db.clean()).then(() => db.loadUserFixtures());
});

test("Get user using FacebookID", function(t) {
  var fbID = "1028279607252642";
  return Account.getUserByFacebookMsgID(fbID).then(function (result) {
    t.ok(result);
  });
});

test("Get FacebookID with user", function(t) {
  var userID = db.createObjectID("6716893a8c8aff3221812148");
  return Account.getFacebookMsgID(userID).then(function (fbID) {
    t.equal(fbID, "1028279607252619");
  });
});

test("Create new user with FacebookID", function(t) {
  var fbID = "1028279607252619"
  return Account.createUserWithFacebookMsgID(fbID).then(function (user) {
    t.ok(user);
    t.equal(user.facebookMessageID, fbID);
  });
});

after("after account testing", function(t) {
  return db.close();
});
