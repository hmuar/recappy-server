'use strict';

const Collection = require('../db/collection');
const User = Collection.User;

var Account = function() {}

// `fbMsgID` is string used by Facebook to identify users
Account.prototype.getUserByFacebookMsgID = function(fbMsgID, cb) {
  return User.findOne({facebookMessageID: fbMsgID});
}

// Find user with a MongoDB ObjectID and get associated
// string used by facebook for user id.
Account.prototype.getFacebookMsgID = function(userID) {
  return User.findOne({_id: userID,
                      facebookMessageID: {$exists: true}})
             .then((user) => {
               if(user) { return user.facebookMessageID; }
               else { return null; }
             });
}

// Create new user and associate Facebook string ID.
Account.prototype.createUserWithFacebookMsgID = function(fbMsgID) {
  var user = new User({
    name: '',
    email: '',
    facebookMessageID: fbMsgID
  });
  return user.save().then((user) => {
    return user;
  });
}

module.exports = Account;
