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
    firstName: user.firstName,
    lastName: user.lastName,
    expireDate: new Date(),
  };
  // return Promise.resolve(0);
  return controller.send(sendInfo);
}

function sendForOneUser() {
  const hemuUser = {
    _id: ObjectID('59bad7921df0f40052a9b89f'),
    facebookMessageID: '1028279607252642',
    firstName: 'Hemu',
    lastName: 'Arum',
    notification: {
      facebook: {
        on: true,
      },
    },
  };
  // const oneUserDev = {
  //   _id: ObjectID('5996ee1a62421a9b5e1def1f'),
  //   facebookMessageID: '1555878001098324',
  //   notification: {
  //     facebook: {
  //       on: true,
  //     },
  //   },
  // };
  const specificUser = {
    _id: ObjectID('59bb05ef1df0f40052a9b8b3'),
    facebookMessageID: '1976761172337884',
    firstName: 'Derek',
    lastName: 'Beard',
    notification: {
      facebook: {
        on: true,
      },
    },
  };
  // return notifyUser(specificUser, hardcodedSubjectID);
  return notifyUser(hemuUser, hardcodedSubjectID);
}

function sendNotifications() {
  return Account.getUsersForFacebookNotification().then(fbUsers => {
    // pull only users that have facebook notifications pref on
    const targetUsers = fbUsers.filter(
      u => u.notification && u.notification.facebook && u.notification.facebook.on
    );
    // notify each user
    const notificationPromises = targetUsers.map(targetUser =>
      notifyUser(targetUser, hardcodedSubjectID)
    );
    return Promise.all(notificationPromises);
  });
}

function notify() {
  const db = new Database();
  // db.setup().then(() => sendNotifications()).then(() => process.exit(0));
  db
    .setup()
    .then(() => sendForOneUser())
    .then(() => process.exit(0));
}

export default notify;
