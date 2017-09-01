import { ObjectID } from '~/db/collection';
import NotificationController from '~/notification/controller';
import AdapterFB from '~/adapter/fbmessenger/fbmessenger';
import Database from '~/db/db';
import Account from '~/account';

const hardcodedSubjectID = ObjectID('e8af4a4963a400483bb70593');
const controller = new NotificationController(AdapterFB);

function notifyUser(user, subjectID) {
  const sendInfo = {
    subjectID,
    senderID: user.facebookMessageID,
    userID: user._id,
    expireDate: new Date(),
  };
  // return Promise.resolve(0);
  return controller.send(sendInfo);
}

function sendForOneUser() {
  const oneUser = {
    _id: ObjectID('5996f879c793f3003d6dd2a6'),
    facebookMessageID: '1028279607252642',
    notification: {
      facebook: {
        on: true,
      },
    },
  };
  const oneUserDev = {
    _id: ObjectID('5996ee1a62421a9b5e1def1f'),
    facebookMessageID: '1555878001098324',
    notification: {
      facebook: {
        on: true,
      },
    },
  };
  return notifyUser(oneUser, hardcodedSubjectID);
}

function sendNotifications() {
  return Account.getUsersForFacebookNotification().then(fbUsers => {
    // pull only users that have facebook notifications pref on
    const targetUsers = fbUsers.filter(
      u => u.notification && u.notification.facebook && u.notification.facebook.on
    );
    // notify each user
    const notificationPromises = targetUsers.map(targetUser =>
      notifyUser(targetUser, hardcodedSubjectID));
    return Promise.all(notificationPromises);
  });
}

function notify() {
  const db = new Database();
  db.setup().then(() => sendNotifications()).then(() => process.exit(0));
  // db.setup().then(() => sendForOneUser()).then(() => process.exit(0));
}

export default notify;
