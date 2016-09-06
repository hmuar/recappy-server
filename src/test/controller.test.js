import test from 'blue-tape';
import AdapterFB from '../adapter/fbmessenger/fbmessenger';
import TestDatabase from './test_database';
import Controller from '../controller/controller';
import Input from '../core/input';
// import { SessionState } from '../core/session_state';

const before = test;
const after = test;
const db = new TestDatabase();

const controller = new Controller(AdapterFB);

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
  const msg = {
    timestamp: 1,
    senderID: '1028279607252642',
    userID: null,
    subjectName: 'crash-course-biology',
    subjectID: db.createObjectID('f64c57184a4ef7f0357f9cd6'),
    input: {
      type: Input.Type.ACCEPT,
      payload: null,
    },
  };

  controller.registerMsg(msg).then((rMsg) => {
    t.ok(rMsg.session);
    t.notDeepLooseEqual(rMsg.session.queueIndex, null);
    t.ok(rMsg.session.noteQueue);
    t.ok(rMsg.session.state);
    t.notDeepLooseEqual(rMsg.session.globalIndex, null);
    t.ok(rMsg.evalCtx);
    t.ok(rMsg.recordCtx);
    t.ok(rMsg.nextState);
    t.end();
  }).catch((error) => {
    console.error(error);
    t.fail('could not register message');
    t.end();
  });
});

// senderID doesn't have an existing session in test database
// so this tests process of session creation
// test('register message for new session', t => {
//   const msg = {
//     timestamp: 1,
//     senderID: '2028279607252615',
//     userID: null,
//     text: 'hello',
//     action: null,
//     subjectName: 'crash-course-biology',
//   };
//
//   controller.registerMsg(msg).then((rMsg) => {
//     t.ok(rMsg.session);
//     t.ok(rMsg.session.noteQueue.length > 0);
//     t.equal(rMsg.session.state, SessionState.INFO);
//     t.end();
//   }).catch((error) => {
//     console.error(error);
//     t.fail('could not register message');
//     t.end();
//   });
// });


after('after controller testing', () => db.close());
