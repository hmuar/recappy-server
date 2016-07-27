// database param should be instance of Database or TestDatabase
var _Account = function(database) {
  this.db = database.db;
}

// fbMsgID is string used by facebook to identify users
_Account.prototype.getUserByFacebookMsgID = function(fbMsgID) {
  // this.db.user.findOne({facebookMessageID: fbMsgID}, function(err, doc) {
  //   return doc;
  // });
  return new Promise((resolve, reject) => {
      this.db.user.findOne({facebookMessageID: fbMsgID}, function(err, doc) {
        if(!err) { resolve(doc); }
        else { reject(err); }
      });
  });

}

// Find user with a MongoDB ObjectID and get associated
// string used by facebook for user id.
// _Account.getFacebookMsgID = function(userID) {
//   var user = User.findOne({_id: userID});
//   if(user !== undefined) {
//     if(user.hasOwnProperty('facebookMessageID')){
//       return user.facebookMessageID;
//     }
//   }
//   return null;
// }
//
// Create new user and associate facebook string ID.
// _Account.createUserWithFacebookMsgID = function(fbMsgID) {
//   var newUser = {
//     name: '',
//     email: '',
//     facebookMessageID: fbMsgID
//   }
//   var userID = User.insert(newUser);
//   return userID;
// }

module.exports = _Account;
