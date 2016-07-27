var tap = require('tap');
// var server = require('./test_server').server;
var TestDatabase = require('./test_database');

// ------ Server and database setup --------------------
var db = new TestDatabase();
// server.register([], (err) => {
//     if (err) {
//       throw err; // something bad happened loading the plugin
//     }
//     console.log("trying to start test server.........." + server.info.uri);
//     server.start((err) => {
//       if (err) {
//         throw err;
//       }
//       server.log('info', 'Test server running at: ' + server.info.uri);
//     });
// });
db.setup();
// -----------------------------------------------------

var Account = require('../account/account');
var account = new Account(db);

db.loadUserFixtures();

tap.test("FBMessenger getUserByFacebookMsgID", function(t) {
  var testID = "1028279607252642"
  return account.getUserByFacebookMsgID(testID).then(function (result) {
    t.ok(result);
    t.end();
  });
});

db.tearDown();
