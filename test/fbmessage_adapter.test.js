'use strict';

const test = require('blue-tape');
const before = test;
const after = test;
const AdapterFB = require('../adapter/fbmessenger/fbmessenger');
const TestDatabase = require('./test_database');
const Immut = require('immutable');
const sinon = require('sinon');
const request = require('request');

const db = new TestDatabase();

before("before fb message adapter testing", function(t) {
  return db.setup().then(() => db.clean()).then(() => db.loadAllFixtures());
});

test("convert user", function(t) {
  let messageData = Immut.Map({
    senderID: "1028279607252619"
  });
  return AdapterFB.convertUser(messageData).then(function(mData) {
    t.ok(mData);
    t.equal(mData.get("userID").toString(), "6716893a8c8aff3221812148");
  });
});

test("create user", function(t) {
  let messageData = Immut.Map({
    senderID: "8028279607252688"
  });
  return AdapterFB.createUser(messageData).then(function(mData) {
    t.ok(mData);
    t.ok(mData.get("userID"));
  });
});

test("parse text request into message data", function(t) {
  let request = {
    "object":"page",
    "entry":[
      {
        "id":"PAGE_ID",
        "time":1460245674269,
        "messaging":[
          {
            "sender":{
              "id": "1028279607252642"
            },
            "recipient":{
              "id":"PAGE_ID"
            },
            "timestamp":1460245672080,
            "postback":{
              "payload":"test user payload"
            }
          }
        ]
      }
    ]
  };
  let mData = AdapterFB.parse(request);
  t.ok(mData.has("timestamp"));
  t.equal(mData.get("timestamp"), 1460245672080);
  t.ok(mData.has("senderID"));
  t.equal(mData.get("senderID"), "1028279607252642");
  t.ok(mData.has("text"));
  t.equal(mData.get("text"), null);
  t.ok(mData.has("action"));
  t.equal(mData.get("action"), "test user payload");
  t.end();
});

test("parse payload request into message data", function(t) {
  let request = {
    "object":"page",
    "entry":[
      {
        "id":"PAGE_ID",
        "time":1460245674269,
        "messaging":[
          {
            "sender":{
              "id": "1028279607252642"
            },
            "recipient":{
              "id":"PAGE_ID"
            },
            "timestamp":1460245672080,
            "message":{
              "mid":"mid.1460245671959:dad2ec9421b03d6f78",
              "seq":216,
              "text":"user response text"
            }
          }
        ]
      }
    ]
  };
  let mData = AdapterFB.parse(request);
  t.ok(mData.has("timestamp"));
  t.equal(mData.get("timestamp"), 1460245672080);
  t.ok(mData.has("senderID"));
  t.equal(mData.get("senderID"), "1028279607252642");
  // t.ok(mData.has("userID"));
  // t.equal(mData.get("userID").toString(), "5716893a8c8aff3221812148");
  t.ok(mData.has("text"));
  t.equal(mData.get("text"), "user response text");
  t.ok(mData.has("action"));
  t.equal(mData.get("action"), null);
  t.end();

});

// TODO: create tests after creating concept of evalContext

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

after("after account testing", function(t) {
  return db.close();
});
