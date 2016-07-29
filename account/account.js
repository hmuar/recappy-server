const Schema = require('../db/schema');
const User = Schema.User;

// database param should be instance of Database or TestDatabase
var _Account = function() {}

// fbMsgID is string used by facebook to identify users
_Account.prototype.getUserByFacebookMsgID = function(fbMsgID, cb) {
  return User.findOne({facebookMessageID: fbMsgID});
}

// Find user with a MongoDB ObjectID and get associated
// string used by facebook for user id.
_Account.prototype.getFacebookMsgID = function(userID) {
  return User.findOne({_id: userID,
                      facebookMessageID: {$exists: true}})
             .then((user) => {
               if(user) { return user.facebookMessageID; }
               else { return null; }
             });
}

// Create new user and associate facebook string ID.
_Account.prototype.createUserWithFacebookMsgID = function(fbMsgID) {
  var user = new User({
    name: '',
    email: '',
    facebookMessageID: fbMsgID
  });
  return user.save().then((user) => {
    return user;
  });
}

module.exports = _Account;
