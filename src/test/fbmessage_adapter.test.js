import Immut from 'immutable';
import test from 'blue-tape';
import AdapterFB from '../adapter/fbmessenger/fbmessenger';
import TestDatabase from './test_database';
import Input from '../core/input';

const before = test;
const after = test;
const db = new TestDatabase();

before('before fb message adapter testing',
  () => db.setup().then(() => db.clean()).then(() => db.loadAllFixtures()));

test('convert sender to user', t => {
  const messageData = Immut.Map({
    senderID: '1028279607252619',
  });
  return AdapterFB.senderToUser(messageData).then(mData => {
    t.ok(mData);
    t.equal(mData.get('userID').toString(), '6716893a8c8aff3221812148');
  });
});

test('create user', t => {
  const messageData = Immut.Map({
    senderID: '8028279607252688',
  });
  return AdapterFB.createUser(messageData).then(mData => {
    t.ok(mData);
    t.ok(mData.get('userID'));
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
          },
        ],
      },
    ],
  };
  const mData = AdapterFB.parse(request);
  t.ok(mData.has('timestamp'));
  t.equal(mData.get('timestamp'), 1460245672080);
  t.ok(mData.has('senderID'));
  t.equal(mData.get('senderID'), '1028279607252642');
  // t.ok(mData.has("userID"));
  // t.equal(mData.get("userID").toString(), "5716893a8c8aff3221812148");
  t.ok(mData.has('input'));
  t.equal(mData.get('input').type, Input.Type.CUSTOM);
  t.equal(mData.get('input').data, 'user response text');
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
            postback: {
              payload: 'accept',
            },
          },
        ],
      },
    ],
  };
  const mData = AdapterFB.parse(request);
  t.ok(mData.has('timestamp'));
  t.equal(mData.get('timestamp'), 1460245672080);
  t.ok(mData.has('senderID'));
  t.equal(mData.get('senderID'), '1028279607252642');
  t.ok(mData.has('input'));
  t.equal(mData.get('input').type, Input.Type.ACCEPT);
  t.equal(mData.get('input').data, null);
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
            postback: {
              payload: 'reject',
            },
          },
        ],
      },
    ],
  };
  const mData = AdapterFB.parse(request);
  t.ok(mData.has('timestamp'));
  t.equal(mData.get('timestamp'), 1460245672080);
  t.ok(mData.has('senderID'));
  t.equal(mData.get('senderID'), '1028279607252642');
  t.ok(mData.has('input'));
  t.equal(mData.get('input').type, Input.Type.REJECT);
  t.equal(mData.get('input').data, null);
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
            postback: {
              payload: 'choice-5',
            },
          },
        ],
      },
    ],
  };
  const mData = AdapterFB.parse(request);
  t.ok(mData.has('timestamp'));
  t.equal(mData.get('timestamp'), 1460245672080);
  t.ok(mData.has('senderID'));
  t.equal(mData.get('senderID'), '1028279607252642');
  t.ok(mData.has('input'));
  t.equal(mData.get('input').type, Input.Type.CUSTOM);
  t.equal(mData.get('input').data, 5);
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

after('after account testing', () => db.close());
