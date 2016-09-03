import { User } from '../db/collection';

// `fbMsgID` is string used by Facebook to identify users
function getUserByFacebookMsgID(fbMsgID) {
  return User.findOne({ facebookMessageID: fbMsgID });
}

// Find user with a MongoDB ObjectID and get associated
// string used by facebook for user id.
function getFacebookMsgID(userID) {
  return User.findOne({ _id: userID,
                      facebookMessageID: { $exists: true } })
             .then((user) => {
               if (user) {
                 return user.facebookMessageID;
               }
               return null;
             });
}

// Create new user and associate Facebook string ID.
function createUserWithFacebookMsgID(fbMsgID) {
  const user = new User({
    name: '',
    email: '',
    facebookMessageID: fbMsgID,
  });
  return user.save().then((savedUser) => savedUser);
}

const Account = {
  getUserByFacebookMsgID,
  getFacebookMsgID,
  createUserWithFacebookMsgID,
};

export default Account;
