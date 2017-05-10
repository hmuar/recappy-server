import request from 'request-promise';
import Config from '~/config/config';
import { log } from '~/logger';
import MessageType from './fbmessage_type';

const FB_REQUEST_URL = `https://graph.facebook.com/v2.6/me/messages?access_token=${Config.FBToken}`;
const MIN_TYPING_DELAY_MILLISECONDS = 1000;
const MAX_TYPING_DELAY_MILLISECONDS = 3500;
const AVG_WORDS_PER_SECOND = 12;
const SECS_TO_MILLISECONDS = 1000;

function getReqBodyTemplate(senderID) {
  return {
    recipient: {
      id: senderID,
    },
    message: {},
  };
}

function getReqTextBody(text) {
  return {
    text,
  };
}
function getReqPayloadBody(text, buttons) {
  const btnData = buttons.map(btn => ({
    type: 'postback',
    title: btn.title,
    payload: btn.action,
  }));

  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text,
        buttons: btnData,
      },
    },
  };
}

function getReqQuickReplyBody(text, replies) {
  const replyData = replies.map(reply => ({
    content_type: 'text',
    title: reply.title,
    payload: reply.action,
  }));

  // "text":"Pick a color:",
  // "quick_replies":[
  //   {
  //     "content_type":"text",
  //     "title":"Red",
  //     "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED"
  //   },
  //   {
  //     "content_type":"text",
  //     "title":"Green",
  //     "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
  //   }
  // ]
  return {
    text,
    quick_replies: replyData,
  };
}

function getReqImageBody(imgUrl) {
  return {
    attachment: {
      type: 'image',
      payload: {
        url: imgUrl,
      },
    },
  };
}

function postBodyCreator(msgType) {
  if (msgType === MessageType.TEXT) {
    return (senderID, text) => {
      const req = getReqBodyTemplate(senderID);
      req.message = getReqTextBody(text);
      return req;
    };
  } else if (msgType === MessageType.POSTBACK) {
    // buttons is a list of {title, action}
    return (senderID, text, buttons) => {
      const req = getReqBodyTemplate(senderID);
      req.message = getReqPayloadBody(text, buttons);
      return req;
    };
  } else if (msgType === MessageType.QUICK_REPLY) {
    return (senderID, text, replies) => {
      const req = getReqBodyTemplate(senderID);
      req.message = getReqQuickReplyBody(text, replies);
      return req;
    };
  } else if (msgType === MessageType.IMAGE) {
    return (senderID, imgUrl) => {
      const req = getReqBodyTemplate(senderID);
      req.message = getReqImageBody(imgUrl);
      return req;
    };
  }
  return null;
}

function sendPostRequest(body) {
  const options = {
    json: true,
    url: FB_REQUEST_URL,
    body,
  };
  return request.post(options);
}

function delay(t) {
  return new Promise(resolve => {
    setTimeout(resolve, t);
  });
}
// add artificial delay
// setTimeout((function() {res.send(items)}), 2000)

export function getTypingDelay(text) {
  const numWords = text.split(' ').length;
  console.log(
    `Looking at ${numWords} words: ${numWords / AVG_WORDS_PER_SECOND * SECS_TO_MILLISECONDS}`
  );
  return Math.min(
    Math.max(MIN_TYPING_DELAY_MILLISECONDS, numWords / AVG_WORDS_PER_SECOND * SECS_TO_MILLISECONDS),
    MAX_TYPING_DELAY_MILLISECONDS
  );
}

function sendTypingIndicator(senderID) {
  const postBody = {
    recipient: {
      id: senderID,
    },
    sender_action: 'typing_on',
  };
  return postBody;
}

export function sendText(senderID, text) {
  log(`sending text: ${text}`);
  const bodyCreator = postBodyCreator(MessageType.TEXT);
  const delayDuration = getTypingDelay(text);
  sendPostRequest(sendTypingIndicator(senderID));
  return delay(delayDuration).then(() => sendPostRequest(bodyCreator(senderID, text)));
}

// replies is list of {title, action}
export function sendQuickReply(senderID, text, replies) {
  log(`sending replies: ${text}`);
  const bodyCreator = postBodyCreator(MessageType.QUICK_REPLY);
  const delayDuration = getTypingDelay(text);
  sendPostRequest(sendTypingIndicator(senderID));
  return delay(delayDuration).then(() => sendPostRequest(bodyCreator(senderID, text, replies)));
}

// buttons is list of {title, action}
export function sendButtons(senderID, text, buttons) {
  log(`sending buttons: ${text}`);
  const bodyCreator = postBodyCreator(MessageType.POSTBACK);
  const delayDuration = getTypingDelay(text);
  sendPostRequest(sendTypingIndicator(senderID));
  return delay(delayDuration).then(() => sendPostRequest(bodyCreator(senderID, text, buttons)));
}

export function sendImage(senderID, imgURL) {
  log(`sending img: ${imgURL}`);
  const bodyCreator = postBodyCreator(MessageType.IMAGE);
  return sendPostRequest(bodyCreator(senderID, imgURL));
}

export function sendUserDetailsRequest(senderID) {
  const uri = `https://graph.facebook.com/v2.6/${senderID}?fields=first_name,last_name,locale,timezone,gender&access_token=${Config.FBToken}`;
  const options = {
    uri,
    json: true,
  };
  return request.get(options);
}
