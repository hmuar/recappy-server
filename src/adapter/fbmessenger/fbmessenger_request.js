import request from 'request';
import MessageType from './fbmessage_type';
import Config from '../../config/config';
import { log } from '../../logger';

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
  const btnData = buttons.map((btn) => (
    {
      type: 'postback',
      title: btn.title,
      payload: btn.action,
    }
  ));

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
  } else if (msgType === MessageType.IMAGE) {
    return (senderID, imgUrl) => {
      const req = getReqBodyTemplate(senderID);
      req.message = getReqImageBody(imgUrl);
      return req;
    };
  }
  return null;
}

function sendPostRequest(body, callback) {
  const options = {
    json: true,
    url: `https://graph.facebook.com/v2.6/me/messages?access_token=${Config.FBToken}`,
    body,
  };
  request.post(options, callback);
}

export function sendText(senderID, text, callback) {
  log(`sending text: ${text}`);
  const bodyCreator = postBodyCreator(MessageType.TEXT);
  sendPostRequest(bodyCreator(senderID, text), callback);
}

// buttons is list of {title, action}
export function sendButtons(senderID, text, buttons, callback) {
  log(`sending buttons: ${text}`);
  const bodyCreator = postBodyCreator(MessageType.POSTBACK);
  sendPostRequest(bodyCreator(senderID, text, buttons), callback);
}

export function sendImage(senderID, imgURL, callback) {
  log(`sending img: ${imgURL}`);
  const bodyCreator = postBodyCreator(MessageType.IMAGE);
  sendPostRequest(bodyCreator(senderID, imgURL), callback);
}
