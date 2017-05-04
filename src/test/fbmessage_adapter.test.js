import test from 'blue-tape';
import AdapterFB from '~/adapter/fbmessenger/fbmessenger';
import Input from '~/core/input';
import TestDatabase from './test_database';

const before = test;
const after = test;
const db = new TestDatabase();

before('before fb message adapter testing', () =>
  db.setup().then(() => db.clean()).then(() => db.loadAllFixtures()));

test('convert sender to user', t => {
  const messageData = {
    senderID: '1028279607252619',
  };
  return AdapterFB.senderToUser(messageData).then(mData => {
    t.ok(mData);
    t.equal(mData.userID.toString(), '6716893a8c8aff3221812148');
  });
});

test('create user', t => {
  const messageData = {
    senderID: '8028279607252688',
  };
  return AdapterFB.createUser(messageData).then(mData => {
    t.ok(mData);
    t.ok(mData.userID);
  });
});

test('parse text request into message data', t => {
  const request = {
    object: 'page',
    entry: [
      {
        id: 'PAGE_ID',
        time: 1460245674269,
        messaging: [
          {
            sender: {
              id: '1028279607252642',
            },
            recipient: {
              id: 'PAGE_ID',
            },
            timestamp: 1460245672080,
            message: {
              mid: 'mid.1460245671959:dad2ec9421b03d6f78',
              seq: 216,
              text: 'user response text',
            },
          }
        ],
      }
    ],
  };
  const mData = AdapterFB.parse(request)[0];
  t.ok({}.hasOwnProperty.call(mData, 'timestamp'));
  t.equal(mData.timestamp, 1460245672080);
  t.ok({}.hasOwnProperty.call(mData, 'senderID'));
  t.equal(mData.senderID, '1028279607252642');
  t.ok({}.hasOwnProperty.call(mData, 'input'));
  t.equal(mData.input.type, Input.Type.CUSTOM);
  t.equal(mData.input.payload, 'user response text');
  t.end();
});

test('parse accept payload request into message data', t => {
  const request = {
    object: 'page',
    entry: [
      {
        id: 'PAGE_ID',
        time: 1460245674269,
        messaging: [
          {
            sender: {
              id: '1028279607252642',
            },
            recipient: {
              id: 'PAGE_ID',
            },
            timestamp: 1460245672080,
            message: {
              quick_reply: { payload: 'accept', },
              mid: 'mid.$cAADC6JqUd5piBUMhiFb0_3k8oII5',
              seq: 158707,
              text: 'ok keep going',
            },
          }
        ],
      }
    ],
  };
  const mData = AdapterFB.parse(request)[0];
  t.ok({}.hasOwnProperty.call(mData, 'timestamp'));
  t.equal(mData.timestamp, 1460245672080);
  t.ok({}.hasOwnProperty.call(mData, 'senderID'));
  t.equal(mData.senderID, '1028279607252642');
  t.ok({}.hasOwnProperty.call(mData, 'input'));
  t.equal(mData.input.type, Input.Type.ACCEPT);
  t.equal(mData.input.payload, null);
  t.end();
});

test('parse reject payload request into message data', t => {
  const request = {
    object: 'page',
    entry: [
      {
        id: 'PAGE_ID',
        time: 1460245674269,
        messaging: [
          {
            sender: {
              id: '1028279607252642',
            },
            recipient: {
              id: 'PAGE_ID',
            },
            timestamp: 1460245672080,
            message: {
              quick_reply: { payload: 'reject', },
              mid: 'mid.$cAADC6JqUd5piBUMhiFb0_3k8oII5',
              seq: 158707,
              text: 'ok keep going',
            },
          }
        ],
      }
    ],
  };
  const mData = AdapterFB.parse(request)[0];
  t.ok({}.hasOwnProperty.call(mData, 'timestamp'));
  t.equal(mData.timestamp, 1460245672080);
  t.ok({}.hasOwnProperty.call(mData, 'senderID'));
  t.equal(mData.senderID, '1028279607252642');
  t.ok({}.hasOwnProperty.call(mData, 'input'));
  t.equal(mData.input.type, Input.Type.REJECT);
  t.equal(mData.input.payload, null);
  t.end();
});

test('parse choice payload request into message data', t => {
  const request = {
    object: 'page',
    entry: [
      {
        id: 'PAGE_ID',
        time: 1460245674269,
        messaging: [
          {
            sender: {
              id: '1028279607252642',
            },
            recipient: {
              id: 'PAGE_ID',
            },
            timestamp: 1460245672080,
            message: {
              quick_reply: { payload: 'choice-5', },
              mid: 'mid.$cAADC6JqUd5piBUMhiFb0_3k8oII5',
              seq: 158707,
              text: 'ok keep going',
            },
          }
        ],
      }
    ],
  };
  const mData = AdapterFB.parse(request)[0];
  t.ok({}.hasOwnProperty.call(mData, 'timestamp'));
  t.equal(mData.timestamp, 1460245672080);
  t.ok({}.hasOwnProperty.call(mData, 'senderID'));
  t.equal(mData.senderID, '1028279607252642');
  t.ok({}.hasOwnProperty.call(mData, 'input'));
  t.equal(mData.input.type, Input.Type.CUSTOM);
  t.equal(mData.input.payload, 5);
  t.end();
});

// TODO: create tests after fleshing out evalContext

// test("send message", function(t) {
//   let reqStub = sinon.stub(request, 'post')
//     .yields(null, 200);
//     // .yields(null, JSON.stringify({login: "bulkan"}));
//   AdapterFB.sendMessage("1028279607252642", "test text", (err, result) => {
//     t.equal(result, 200);
//     t.end();
//   });
//   request.post.restore();
// });

after('after fb message adapter testing', () => db.close());
