import { User } from '~/db/collection';

// `fbMsgID` is string used by Facebook to identify users
function getUserByFacebookMsgID(fbMsgID) {
  return User.findOne({ facebookMessageID: fbMsgID, });
}

// Find user with a MongoDB ObjectID and get associated
// string used by facebook for user id.
function getFacebookMsgID(userID) {
  return User.findOne({
    _id: userID,
    facebookMessageID: { $exists: true, },
  }).then(user => {
    if (user) {
      return user.facebookMessageID;
    }
    return null;
  });
}

export function updateFacebookUserDetails(fbMsgID, userDetails) {
  console.log(`trying to update user details for ${fbMsgID}`);
  console.log(`with details ${userDetails}`);
  return User.findOne({ facebookMessageID: fbMsgID, }).then(user => {
    if (user) {
      const existingUser = user;
      const { first_name, last_name, timezone, locale, gender, } = userDetails;
      console.log(`${first_name}, ${last_name}, ${timezone}, ${locale}, ${gender}`);
      existingUser.firstName = first_name;
      existingUser.lastName = last_name;
      existingUser.timezone = timezone;
      existingUser.locale = locale;
      existingUser.gender = gender;
      return user.save();
    }
    return {};
  });
}

// Create new user and associate Facebook string ID.
function createUserWithFacebookMsgID(fbMsgID) {
  const user = new User({
    name: '',
    email: '',
    facebookMessageID: fbMsgID,
  });
  return user.save().then(savedUser => savedUser);
}

const Account = {
  getUserByFacebookMsgID,
  getFacebookMsgID,
  createUserWithFacebookMsgID,
};

export default Account;