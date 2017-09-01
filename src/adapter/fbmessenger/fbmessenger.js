import Account from '~/account';
import Input from '~/core/input';
// import { EvalStatus } from '~/core/eval';
// import { log, logErr } from '~/logger';
import MessageType from './fbmessage_type';
import sendResp, { sendFeedbackResp } from './fbmessenger_response';
import { sendUserDetailsRequest } from './fbmessenger_request';

const HARDCODED_SUBJ_NAME = 'news';

// Adapter for parsing incoming requests and responding
// if user is using Facebook Messenger platform.

// Process senderID in messageData and convert to
// proper app userID. For example, in facebook messenger,
// the userID is initially a facebook ID. This needs to be
// associated with the proper userID stored for this app.
// `msgData` is Immututable.Map()
function senderToUser(msgData) {
  const fbUserID = msgData.senderID;
  if (!fbUserID) {
    throw new Error('Could not find senderID, could not convert to user');
  } else {
    return Account.getUserByFacebookMsgID(fbUserID).then(user => {
      if (!user) {
        return {
          ...msgData,
          userID: null,
        };
      }
      return {
        ...msgData,
        userID: user._id,
      };
    });
  }
}

// create user with new Facebook Messenger ID
function createUser(mData) {
  const fbUserID = mData.senderID;
  if (!fbUserID) {
    return Promise.error(null);
  }
  return Account.createUserWithFacebookMsgID(fbUserID).then(user => ({
    ...mData,
    userID: user._id,
  }));
}

function getMsgType(msg) {
  if ('message' in msg) {
    if ('quick_reply' in msg.message) {
      return MessageType.QUICK_REPLY;
    }
    return MessageType.TEXT;
  }
  if ('postback' in msg) {
    return MessageType.POSTBACK;
  }
  return MessageType.UNKNOWN;
}

function getNestedProp(parent, prop) {
  return obj => obj[parent][prop];
}

const contentExtractor = {
  [MessageType.TEXT]: getNestedProp('message', 'text'),
  [MessageType.POSTBACK]: getNestedProp('postback', 'payload'),
  [MessageType.QUICK_REPLY]: obj => obj.message.quick_reply.payload,
  [MessageType.UNKNOWN]: () => null,
};

function stripChoiceNum(choice) {
  const c = choice.split('-');
  const cnum = parseInt(c[c.length - 1], 10);
  return cnum;
}

// return a function that properly adds content to a
// given obj object based on given `msgType`
function contentInjector(msgType) {
  if (msgType === MessageType.TEXT) {
    return (msg, content) => ({
      ...msg,
      input: {
        type: Input.Type.CUSTOM,
        payload: content,
      },
    });
  } else if (msgType === MessageType.POSTBACK || msgType === MessageType.QUICK_REPLY) {
    return (msg, content) => {
      let mtype = null;
      let dataVal = null;

      if (content === 'accept') {
        mtype = Input.Type.ACCEPT;
      } else if (content === 'reject') {
        mtype = Input.Type.REJECT;
      } else if (content === 'GET_STARTED_PAYLOAD') {
        mtype = Input.Type.INITIALIZE_NEW_USER;
      } else if (~content.indexOf('choice-')) {
        mtype = Input.Type.CUSTOM;
        // if 'choice-' or 'path-' is in content, it was a payload representing
        // a predefined choice made by user, so strip out choice num
        dataVal = stripChoiceNum(content);
      } else if (~content.indexOf('path-')) {
        mtype = Input.Type.PATH;
        dataVal = stripChoiceNum(content);
      } else {
        // just set data to entirety of input text
        mtype = Input.Type.CUSTOM;
        dataVal = content;
      }
      return {
        ...msg,
        input: {
          type: mtype,
          payload: dataVal,
        },
      };
    };
  }

  return msg => ({
    ...msg,
    input: {
      type: Input.Type.UNKNOWN,
      payload: null,
    },
  });
}

function parseEntry(entry) {
  if (!entry || !entry.messaging) {
    return [];
  }
  return entry.messaging.map(msg => {
    // TODO: Need to dynamically get this from request
    if (!msg.sender || !msg.sender.id || (!msg.message && !msg.postback)) {
      return [];
    }

    const initMsgData = {
      timestamp: msg.timestamp,
      senderID: msg.sender.id,
      pageID: msg.recipient.id,
      subjectName: HARDCODED_SUBJ_NAME,
      input: null,
      seq: msg.message ? msg.message.seq : 0,
    };

    const msgType = getMsgType(msg);
    const content = contentExtractor[msgType](msg);
    const finalMsgData = contentInjector(msgType)(initMsgData, content);
    return finalMsgData;
  });
}

// Parse incoming POST body and return an array of msgs objects
// with standard message data. Sort by msg's seq param
function parse(requestBody) {
  if (!requestBody || !requestBody.entry) {
    return [];
  }
  return requestBody.entry
    .reduce(
      (acc, entry) => {
        const entryMsgs = parseEntry(entry);
        return [...acc, ...entryMsgs];
      },
      []
    )
    .sort((a, b) => a.seq - b.seq);
}

// function evalSuccess(state) {
//   return state && state.evalCtx && state.evalCtx.status === EvalStatus.SUCCESS;
// }

export function getUserDetails(userID) {
  return sendUserDetailsRequest(userID);
}

export function sendResponse(state) {
  return sendResp(state);
}

export function sendFeedbackResponse(state) {
  // if (!evalSuccess(state)) {
  //   return state;
  // }
  return sendFeedbackResp(state);
}

export function transformInput(state) {
  return state;
}

const AdapterFBMessenger = {
  senderToUser,
  createUser,
  parse,
  sendResponse,
  sendFeedbackResponse,
  getUserDetails,
  transformInput,
};

export default AdapterFBMessenger;
