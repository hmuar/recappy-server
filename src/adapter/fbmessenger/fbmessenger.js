import Account from '../../account/account';
import Input from '../../core/input';
import { sendText, sendButtons, sendImage } from './fbmessenger_request';
import { SessionState } from '../../core/session_state';
import generateQuestion from '../../speech';
import MessageType from './fbmessage_type';

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

// create user based with new Facebook Messenger
// specific ID. `msgData` is Immututable.Map()
function createUser(msgData) {
  const fbUserID = msgData.senderID;
  if (!fbUserID) {
    return Promise.error(null);
  }
  return Account.createUserWithFacebookMsgID(fbUserID)
  .then((user) => ({
    ...msgData,
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


export function sendPossibleImage(senderID, note) {
  if ('imgUrl' in note) {
    if (note.imgUrl != null) {
      sendImage(senderID, note.imgUrl);
    }
  }
}

function sendMessageInContext(senderID, session) {
  const fbUserID = senderID;
  const note = session.noteQueue[session.queueIndex];
  switch (session.state) {
    case SessionState.INIT:
      sendText(fbUserID, "Let's get started!");
      break;

    case SessionState.RECALL: {
      const buttonData = [];
      buttonData.push({
        title: 'Tell me the answer',
        action: Input.Type.ACCEPT,
      });
      sendPossibleImage(fbUserID, note);
      const questionText = generateQuestion(note);
      sendButtons(fbUserID, questionText, buttonData);
      break;
    }

    case SessionState.RECALL_RESPONSE: {
      sendPossibleImage(fbUserID, note);
      sendText(fbUserID, note.hidden);
      const buttonData = [];
      buttonData.push({
        title: 'Yes',
        action: Input.Type.ACCEPT,
      });
      buttonData.push({
        title: 'No',
        action: Input.Type.REJECT,
      });
      sendButtons(fbUserID,
        'Is that what you were thinking?', buttonData);
      break;
    }

    case SessionState.INPUT: {
      sendPossibleImage(fbUserID, note);
      const questionText = generateQuestion(note);
      sendText(fbUserID, questionText);
      break;
    }

    case SessionState.MULT_CHOICE: {
      let choicesText = '';
      choicesText += `(1) ${note.choice1}\n`;
      choicesText += `(2) ${note.choice2}\n`;
      choicesText += `(3) ${note.choice3}\n`;
      choicesText += `(4) ${note.choice4}\n`;
      choicesText += `(5) ${note.choice5}`;

      sendPossibleImage(fbUserID, note);
      const questionText = generateQuestion(note);
      sendText(fbUserID, questionText);
      // sendButtons(fbUserID, note.displayRaw, buttonData);
      sendText(fbUserID, choicesText);
      break;
    }

    case SessionState.INFO: {
      const buttonData = [];
      buttonData.push({
        title: 'Ok keep going',
        action: Input.Type.ACCEPT,
      });
      sendPossibleImage(fbUserID, note);
      sendButtons(fbUserID, note.displayRaw, buttonData);
      break;
    }
    case SessionState.DONE_SESSION:
      sendText(fbUserID,
        'No more to learn for today, all done! Check back in tomorrow :)');
      break;

    default:
      break;
  }
}

function sendMessage(state) {
  return sendMessageInContext(state.senderID, state.session);
}

const AdapterFBMessenger = {
  senderToUser,
  createUser,
  parse,
  sendMessage,
};

export default AdapterFBMessenger;
