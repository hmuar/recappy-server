import { User } from '~/db/collection';

// `fbMsgID` is string used by Facebook to identify users
function getUserByFacebookMsgID(fbMsgID) {
  return User.findOne({ facebookMessageID: fbMsgID, });
}

function getUsersForFacebookNotification() {
  return User.find({ facebookMessageID: { $exists: true, }, });
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
  return User.findOne({ facebookMessageID: fbMsgID, }).then(user => {
    if (user) {
      const existingUser = user;
      const { first_name, last_name, timezone, locale, gender, } = userDetails;
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
    notification: {
      facebook: {
        on: true,
      },
    },
  });
  return user.save().then(savedUser => savedUser);
}

const Account = {
  getUserByFacebookMsgID,
  getFacebookMsgID,
  createUserWithFacebookMsgID,
  getUsersForFacebookNotification,
};

export default Account;
