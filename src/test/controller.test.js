import test from 'blue-tape';
import AdapterFB from '~/adapter/fbmessenger/fbmessenger';
import Controller from '~/controller/controller';
import Input from '~/core/input';
import TestDatabase from './test_database';

const before = test;
const after = test;
const db = new TestDatabase();

const controller = new Controller(AdapterFB);
controller.sendResponse = (state) => {
  console.log('Stubbed out controller.sendResponse');
  return state;
};
controller.sendFeedbackResponse = (state) => {
  console.log('Stubbed out controller.sendFeedbackResponse');
  return state;
};

before('before controller testing',
  () => db.setup().then(() => db.clean()).then(() => db.loadAllFixtures()));

test('controller pipe user', t => {
  const mData = {
    senderID: '1028279607252642',
    subjectName: 'crash-course-biology',
  };
  controller.pipeUser(mData).then((mDataWithUser) => {
    t.ok(mDataWithUser);
    t.ok(mDataWithUser.userID);
    t.equal(mDataWithUser.userID.toString(), '5716893a8c8aff3221812148');
    t.end();
  });
});

test('register message with existing user, existing session', t => {
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
    t.ok(rMsg.userID);
    t.ok(rMsg.session);
    t.notDeepLooseEqual(rMsg.session.queueIndex, null);
    t.ok(rMsg.session.noteQueue);
    t.ok(rMsg.session.state);
    t.notDeepLooseEqual(rMsg.session.globalIndex, null);
    t.ok(rMsg.evalCtx);
    t.ok(rMsg.preEvalState);
    t.ok(rMsg.postEvalState);
    t.end();
  }).catch((error) => {
    console.error(error);
    t.fail('could not register message');
    t.end();
  });
});

// senderID has existing user, but no existing session in test database
// so this tests process of session creation
test('register message for existing user, no existing session', t => {
  const msg = {
    timestamp: 1,
    senderID: '2028279607252615',
    userID: null,
    subjectName: 'crash-course-biology',
    input: {
      type: Input.Type.CUSTOM,
      payload: 'halllooo',
    },
  };

  controller.registerMsg(msg).then((rMsg) => {
    t.ok(rMsg.userID);
    t.ok(rMsg.session);
    t.ok(rMsg.session.noteQueue.length > 0);
    t.end();
  }).catch((error) => {
    console.error(error);
    t.fail('could not register message');
    t.end();
  });
});

// senderID has no existing user, but no existing session in test database
// so this tests process of session creation
test('register message for no existing user, no existing session', t => {
  const msg = {
    timestamp: 1,
    senderID: '9028279607252619',
    userID: null,
    subjectName: 'crash-course-biology',
    input: {
      type: Input.Type.CUSTOM,
      payload: 'halllooo',
    },
  };

  controller.registerMsg(msg).then((rMsg) => {
    t.ok(rMsg.userID);
    t.ok(rMsg.session);
    t.ok(rMsg.session.noteQueue.length > 0);
    t.end();
  }).catch((error) => {
    console.error(error);
    t.fail('could not register message');
    t.end();
  });
});

after('after controller testing', () => db.close());
