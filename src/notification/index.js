import { ObjectID } from '~/db/collection';
import NotificationController from '~/notification/controller';
import AdapterFB from '~/adapter/fbmessenger/fbmessenger';
import Database from '~/db/db';
import Account from '~/account';
import { getUsersForFacebookNotification } from '~/notification/notify_assistant';

const hardcodedSubjectID = ObjectID('e8af4a4963a400483bb70593');
const controller = new NotificationController(AdapterFB);

// const DEV_USER_ID = ObjectID('59bad7921df0f40052a9b89f');
const DEV_USER_ID = ObjectID('5996ee1a62421a9b5e1def1f');
const IDLE_HOURS_THRESHOLD = 1;

function notifyUser(user, subjectID) {
  const sendInfo = {
    subjectID,
    senderID: user.facebookMessageID,
    userID: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    expireDate: new Date(),
  };
  return controller.send(sendInfo);
}

function sendForUserID(userID) {
  return Account.getUserByID(userID).then(user => notifyUser(user, hardcodedSubjectID));
}

function sendForAllUsers() {
  return getUsersForFacebookNotification(IDLE_HOURS_THRESHOLD).then(fbUsers => {
    const notificationPromises = fbUsers.map(fbUser => notifyUser(fbUser, hardcodedSubjectID));
    return Promise.all(notificationPromises).then(() =>
      console.log(`Done with ${fbUsers.length} users.`)
    );
  });
}

function sendTest() {
  // return Promise.resolve(0);
  return getUsersForFacebookNotification(IDLE_HOURS_THRESHOLD).then(users => console.log(users));
}

export function notifyDevUser() {
  const db = new Database();
  db
    .setup()
    .then(() => sendForUserID(DEV_USER_ID))
    .then(() => process.exit(0));
}

export function notifyWithUserID(userID) {
  const db = new Database();
  db
    .setup()
    .then(() => sendForUserID(userID))
    .then(() => process.exit(0));
}

export function notifyAllUsers() {
  const db = new Database();
  db
    .setup()
    .then(() => sendForAllUsers())
    .then(() => process.exit(0));
}

export function notifyTest() {
  const db = new Database();
  db
    .setup()
    .then(() => sendTest())
    .then(() => process.exit(0));
}
