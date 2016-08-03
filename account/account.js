'use strict';

const Collection = require('../db/collection');
const User = Collection.User;

// `fbMsgID` is string used by Facebook to identify users
function getUserByFacebookMsgID(fbMsgID) {
  return User.findOne({facebookMessageID: fbMsgID});
}

// Find user with a MongoDB ObjectID and get associated
// string used by facebook for user id.
function getFacebookMsgID(userID) {
  return User.findOne({_id: userID,
                      facebookMessageID: {$exists: true}})
             .then((user) => {
               if(user) { return user.facebookMessageID; }
               else { return null; }
             });
}

// Create new user and associate Facebook string ID.
function createUserWithFacebookMsgID(fbMsgID) {
  var user = new User({
    name: '',
    email: '',
    facebookMessageID: fbMsgID
  });
  return user.save().then((user) => {
    return user;
  });
}

var Account = {
  getUserByFacebookMsgID: getUserByFacebookMsgID,
  getFacebookMsgID: getFacebookMsgID,
  createUserWithFacebookMsgID: createUserWithFacebookMsgID
}

module.exports = Account;
