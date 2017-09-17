import { ObjectID, StudentSession, User } from '~/db/collection';

const DEV_USER_ID = ObjectID('59bad7921df0f40052a9b89f');

function notifiableFacebookUsersByIDList(userIDs) {
  return User.find({
    _id: { $in: userIDs, },
    facebookMessageID: { $exists: true, },
    'notification.facebook.on': { $eq: true, },
  });
}

// return list of user ids that do not have not updated their session
// in {hourInterval} time
function idleUsers(hourInterval) {
  const thresholdDate = new Date();
  thresholdDate.setHours(thresholdDate.getHours() - hourInterval);
  return StudentSession.find(
    {
      updatedAt: {
        $lte: thresholdDate,
      },
    },
    { userID: 1, _id: 0, }
  )
    .lean()
    .then(userIDs => {
      if (userIDs) {
        return notifiableFacebookUsersByIDList(userIDs.map(i => i.userID));
      }
      return [];
    });
}

export function getUsersForFacebookNotification(idleHours) {
  return idleUsers(idleHours);
}
