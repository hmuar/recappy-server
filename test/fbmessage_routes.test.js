import test from 'blue-tape';
const before = test;
const after = test;

import TestDatabase from './test_database';
const db = new TestDatabase();
import FBmessage from "../resource/fbmessenger";
import server from './test_server';

// Server setup
before("before fb message routes testing", t => server.start());

// FBMessenger will hit this route with a GET request
// with a hub.challenge that must be responded to when
// first registering the webhook address.
test("FBmessage route GET", t => {
  var options = {
      method: "GET",
      url: FBmessage.getRoutePath("/api/v1") + "?hub.challenge=35",
  };

  return server.inject(options).then((response) => {
    t.equal(response.statusCode, 200);
    t.equal(response.result, 35);
  });
});

// Main POST route which receives all incoming messages
test("FBmessage route POST", t => {

    var msg = {
      "object":"page",
      "entry":[
        {
          "id":"PAGE_ID",
          "time":1460245674269,
          "messaging":[
            {
              "sender":{
                "id":"USER_ID"
              },
              "recipient":{
                "id":"PAGE_ID"
              },
              "timestamp":1460245672080,
              "message":{
                "mid":"mid.1460245671959:dad2ec9421b03d6f78",
                "seq":216,
                "text":"hello"
              }
            }
          ]
        }
      ]
    }

    var options = {
        method: "POST",
        url: FBmessage.getRoutePath("/api/v1"),
        payload: msg
    };

    return server.inject(options).then((response) => {
      t.equal(response.statusCode, 200);
    });

});

after("after", t => server.stop());
