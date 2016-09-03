import Immut from 'immutable';
import test from 'blue-tape';
import AdapterFB from '../adapter/fbmessenger/fbmessenger';
import TestDatabase from './test_database';
import cMod from '../controller/controller';

const before = test;
const after = test;
const db = new TestDatabase();

const Controller = new cMod(AdapterFB);

before('before controller testing',
  () => db.setup().then(() => db.clean()).then(() => db.loadAllFixtures()));

test('register message with existing session', t => {
  // `msg` = {
  //   timestamp  : ""
  //   senderID   : "",
  //   userID     : ObjectID,
  //   text       : "",
  //   action     : ""
  // }
  const msg = Immut.Map({
    timestamp: 1,
    senderID: '1028279607252642',
    userID: null,
    text: 'hello',
    action: null,
    subjectName: 'crash-course-biology',
  });

  Controller.registerMsg(msg).then((rMsg) => {
    t.ok(rMsg.get('session'));
    t.end();
  }).catch((error) => {
    console.error(error);
    t.fail('could not register message');
    t.end();
  });
});

// senderID doesn't have an existing session in test database
// so this tests process of session creation
test('register message for new session', t => {
  const msg = Immut.Map({
    timestamp: 1,
    senderID: '2028279607252615',
    userID: null,
    text: 'hello',
    action: null,
    subjectName: 'crash-course-biology',
  });

  Controller.registerMsg(msg).then((rMsg) => {
    t.ok(rMsg.get('session'));
    t.ok(rMsg.get('session').noteQueue.length > 0);
    t.end();
  }).catch((error) => {
    console.error(error);
    t.fail('could not register message');
    t.end();
  });
});


after('after controller testing', () => db.close());
