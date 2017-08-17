import { ObjectID } from '~/db/collection';
import NotificationController from '~/notification/controller';
import AdapterFB from '~/adapter/fbmessenger/fbmessenger';
import Database from '~/db/db';

function sendNotifications() {
  const subject = {
    _id: ObjectID('e8af4a4963a400483bb70593'),
  };

  const user = {
    _id: ObjectID('590269208b70a3809d95deb5'),
    senderID: '1028279607252642',
  };

  const sendInfo = {
    subjectID: subject._id,
    senderID: user.senderID,
    userID: user._id,
    expireDate: new Date(),
  };

  const controller = new NotificationController(AdapterFB);
  return controller.send(sendInfo);
}

function notify() {
  const db = new Database();
  db.setup().then(() => sendNotifications()).then(() => process.exit(0));
}

export default notify;
