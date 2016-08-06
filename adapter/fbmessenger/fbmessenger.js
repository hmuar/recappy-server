'use strict';
const Account = require('../../account/account');
const Input = require('../../core/input');
const Immut = require('immutable');
const fbrequest = require('./fbmessenger_request');
const MessageType = require('./fbmessage_type');

// Adapter for parsing incoming requests and responding
// if user is using Facebook Messenger platform.

// Process senderID in messageData and convert to
// proper app userID. For example, in facebook messenger,
// the userID is initially a facebook ID. This needs to be
// associated with the proper userID stored for this app.
// `msgData` is Immututable.Map()
function senderToUser(msgData) {
  let fbUserID = msgData.get("senderID");
  if(!fbUserID) {
    throw new Error("Could not find senderID, could not convert to user");
  }
  else {
    return Account.getUserByFacebookMsgID(fbUserID)
      .then((user) => {
        if(!user) {
          return msgData.set('userID', null);
        }
        return msgData.set('userID', user._id);
      });
  }
}

// create user based with new Facebook Messenger
// specific ID. `msgData` is Immututable.Map()
function createUser(msgData) {
  let fbUserID = msgData.get("senderID");
  if(!fbUserID) {
    return Promise.error(null);
  }
  return Account.createUserWithFacebookMsgID(fbUserID)
  .then((user) => {
    return msgData.set("userID", user._id);
  });
}

function getMsgType(msg) {
  if('message' in msg) {
    return MessageType.TEXT;
  }
  if('postback' in msg) {
    return MessageType.POSTBACK;
  }
  return MessageType.UNKNOWN;
}

// return a function that properly extracts content
// based on given `msgType`
function contentExtractor(msgType) {
  // return prop nested inside parent
  function getNestedProp(parent, prop) {
    return (obj) => obj[parent][prop];
  }
  let extMap = {};
  extMap[MessageType['TEXT']] = getNestedProp("message", "text"),
  extMap[MessageType['POSTBACK']] = getNestedProp("postback", "payload"),
  extMap[MessageType['UNKNOWN']] = () => null
  return extMap[msgType];
}

// return a function that properly adds content to a
// given Immut.Map object based on given `msgType`
function contentInjector(msgType) {

  if(msgType === MessageType.TEXT) {
    return (msg, content) => {
      return msg.set('input', {
        type: Input.Type.CUSTOM,
        data: content
      });
    }
  }

  else if(msgType === MessageType.POSTBACK) {
    return (msg, content) => {
      let mtype = null;
      let dataVal = null;
      if(content === 'accept') {
        mtype = Input.Type.ACCEPT;
      }
      else if(content === 'reject'){
        mtype = Input.Type.REJECT;
      }
      else {
        mtype = Input.Type.CUSTOM;
        dataVal = content;
      }
      return msg.set('input', {
        type: mtype,
        data: dataVal
      });
    }
  }

  else {
    return (msg, content) => {
      return msg.set('input', {
        type: Input.Type.UNKNOWN,
        data: null
      });
    }
  }

}

// Parse incoming POST request and return an Immut.Map
// object with standard message data
function parse(request) {
  var entry = request.entry[0];
  var msg = entry.messaging[0];

  // TODO: Need to dynamically get this from request
  const HARDCODED_SUBJ_NAME = 'crash-course-biology';

  let initMsgData = Immut.Map({
    timestamp: msg.timestamp,
    senderID: msg.sender.id,
    subjectName: HARDCODED_SUBJ_NAME,
    input: null
  });

  let msgType = getMsgType(msg);
  let content = contentExtractor(msgType)(msg);
  let finalMsgData = contentInjector(msgType)(initMsgData, content);
  return finalMsgData;
}

function sendMessage(userID, evalContext, callback) {
  // convert userID to fbID
  let fbID = userID;
  fbrequest.sendText(fbID, "dummy text", callback);
}

let AdapterFBMessenger = {
  senderToUser: senderToUser,
  createUser: createUser,
  parse: parse,
  sendMessage: sendMessage
};

module.exports = AdapterFBMessenger;
