const Schema = require('../db/schema');

const User = Schema.User;

// database param should be instance of Database or TestDatabase
var _Account = function(database) {
  this.db = database.db;
}

// fbMsgID is string used by facebook to identify users
_Account.prototype.getUserByFacebookMsgID = function(fbMsgID, cb) {
  return User.findOne({facebookMessageID: fbMsgID});
}

// Find user with a MongoDB ObjectID and get associated
// string used by facebook for user id.
_Account.prototype.getFacebookMsgID = function(userID) {
  return new Promise((resolve, reject) => {
    this.db.user.findOne({_id: userID, facebookMessageID: {$exists: true}}, function(err, doc) {
      if(!err) {
        if(doc && doc.hasOwnProperty("facebookMessageID")) {
          resolve(doc.facebookMessageID);
        }
        else {
          resolve(null);
        }
      }
      else { reject(err); }
    });
  });
}

// Create new user and associate facebook string ID.
_Account.prototype.createUserWithFacebookMsgID = function(fbMsgID) {
  var newUser = {
    name: '',
    email: '',
    facebookMessageID: fbMsgID
  }
  return new Promise((resolve, reject) => {
      this.db.user.insert(newUser, function(err, doc) {
          if(!err) { resolve(null); }
          else { reject(err); }
      });
  });
}

module.exports = _Account;
