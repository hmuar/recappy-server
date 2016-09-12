import Account from '~/account/account';
import Input from '~/core/input';
import { EvalStatus } from '~/core/eval';
import MessageType from './fbmessage_type';
import sendResp, { sendFeedbackResp } from './fbmessenger_response';

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
    return Account.getUserByFacebookMsgID(fbUserID)
      .then((user) => {
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
  return Account.createUserWithFacebookMsgID(fbUserID)
  .then((user) => ({
    ...mData,
    userID: user._id,
  }));
}

function getMsgType(msg) {
  if ('message' in msg) {
    return MessageType.TEXT;
  }
  if ('postback' in msg) {
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
  const extMap = {};
  extMap[MessageType.TEXT] = getNestedProp('message', 'text');
  extMap[MessageType.POSTBACK] = getNestedProp('postback', 'payload');
  extMap[MessageType.UNKNOWN] = () => null;
  return extMap[msgType];
}

function stripChoiceNum(choice) {
  const c = choice.split('-');
  const cnum = parseInt(c[c.length - 1], 10);
  return cnum;
}

// return a function that properly adds content to a
// given obj object based on given `msgType`
function contentInjector(msgType) {
  if (msgType === MessageType.TEXT) {
    return (msg, content) => (
      {
        ...msg,
        input: {
          type: Input.Type.CUSTOM,
          payload: content,
        },
      }
    );
  } else if (msgType === MessageType.POSTBACK) {
    return (msg, content) => {
      let mtype = null;
      let dataVal = null;

      if (content === 'accept') {
        mtype = Input.Type.ACCEPT;
      } else if (content === 'reject') {
        mtype = Input.Type.REJECT;
      } else {
        mtype = Input.Type.CUSTOM;
        if (~content.indexOf('choice-')) {
          // if 'choice-' is in content, it was a payload representing
          // a predefined choice made by user, so strip out choice num
          dataVal = stripChoiceNum(content);
        } else {
          // just set data to entirety of input text
          dataVal = content;
        }
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

  return (msg) => (
    {
      ...msg,
      input: {
        type: Input.Type.UNKNOWN,
        payload: null,
      },
    }
  );
}

// Parse incoming POST body and return a msg object
// object with standard message data
function parse(requestBody) {
  const entry = requestBody.entry[0];
  const msg = entry.messaging[0];

  // TODO: Need to dynamically get this from request
  const HARDCODED_SUBJ_NAME = 'crash-course-biology';

  const initMsgData = {
    timestamp: msg.timestamp,
    senderID: msg.sender.id,
    subjectName: HARDCODED_SUBJ_NAME,
    input: null,
  };

  const msgType = getMsgType(msg);
  const content = contentExtractor(msgType)(msg);
  const finalMsgData = contentInjector(msgType)(initMsgData, content);
  return finalMsgData;
}

function evalSuccess(state) {
  return (state &&
          state.evalCtx &&
          state.evalCtx.status === EvalStatus.SUCCESS);
}

// function advancedState(state) {
//   return (state &&
//           state.session &&
//           state.preEvalState &&
//           state.session.state &&
//           state.preEvalState !== state.session.state);
// }

export function sendResponse(state) {
  // if (!advancedState(state)) {
  //   return state;
  // }
  return sendResp(state);
}

export function sendFeedbackResponse(state) {
  if (!evalSuccess(state)) {
    return state;
  }
  return sendFeedbackResp(state);
}

const AdapterFBMessenger = {
  senderToUser,
  createUser,
  parse,
  sendResponse,
  sendFeedbackResponse,
};

export default AdapterFBMessenger;
