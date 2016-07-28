var test = require('blue-tape');
var before = test;
var after = test;

var TestDatabase = require('./test_database');

// ------ Server and database setup --------------------
var db = new TestDatabase();

var Account = require('../account/account');
var account = new Account(db);

// ----------------------
before("before", function(t) {
  return db.setup().then(() => db.loadUserFixtures());
});

test("Get user using FacebookID", function(t) {
  var testID = "1028279607252642";
  return account.getUserByFacebookMsgID(testID).then(function (result) {
    t.ok(result);
  });
});

after("after", function() {
  db.teardown();
});
