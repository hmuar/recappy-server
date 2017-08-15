import { ObjectID } from '~/db/collection';
import NotificationController from '~/notification/controller';
import AdapterFB from '~/adapter/fbmessenger/fbmessenger';
import Database from '~/db/db';

function sendNotifications() {
  console.log('running notify function....');
  const subject = {
    _id: ObjectID('e8af4a4963a400483bb70593'),
  };

  const user = {
    _id: ObjectID('590f4c9e67583966e494cc15'),
    senderID: '1555878001098324',
  };

  const sendInfo = {
    subjectID: subject._id,
    senderID: user.senderID,
    userID: user._id,
    expireDate: new Date('08/29/2017'),
  };

  const controller = new NotificationController(AdapterFB);
  return controller.send(sendInfo).then(state => {});
}

function notify() {
  const db = new Database();
  db.setup().then(() => sendNotifications()).then(() => process.exit(0));
}

export default notify;
