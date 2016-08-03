'use strict';

const Account = require('../account/account');
const Imm = require('immutable');

const MessageType = {
  TEXT: 'text',
  POSTBACK: 'postback',
  UNKNOWN: 'unknown'
}

// Adapter for parsing incoming requests and responding
// if user is using Facebook Messenger platform.

// Process senderID in messageData and convert to
// proper app userID. For example, in facebook messenger,
// the userID is initially a facebook ID. This needs to be
// associated with the proper userID stored for this app.
// `messageData` is Immutable.Map()
function convertUser(msgData) {
  let fbUserID = msgData.get("senderID");
  if(!fbUserID) {
    return Promise.error(null);
  }
  return Account.getUserByFacebookMsgID(fbUserID)
    .then((user) => {
      console.log(user);
      if(!user) {
        return msgData.set('userID', null);
      }
      return msgData.set('userID', user._id);
    });
}

// `msgData` is Immutable.Map()
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

function contentInjector(msgType) {
  let addMap = {};
  addMap[MessageType['TEXT']] = (msg, content) => msg.set('text', content),
  addMap[MessageType['POSTBACK']] = (msg, content) => msg.set('action', content),
  addMap[MessageType['UNKNOWN']] = (msg, content) => msg
  return addMap[msgType]
}

// Parse incoming POST request and return an Imm.Map
// object with standard message data
function parse(request) {
  var entry = request.entry[0];
  var msg = entry.messaging[0];

  let initMsgData = Imm.Map({
    timestamp: msg.timestamp,
    senderID: msg.sender.id,
    text: null,
    action: null
  });

  let msgType = getMsgType(msg);
  let content = contentExtractor(msgType)(msg);
  let finalMsgData = contentInjector(msgType)(initMsgData, content);
  return finalMsgData;
}

function sendMessage(userID, note, state) {

}

let AdapterFBMessenger = {
  convertUser: convertUser,
  createUser: createUser,
  sendMessage: sendMessage,
  parse: parse
};

module.exports = AdapterFBMessenger;
