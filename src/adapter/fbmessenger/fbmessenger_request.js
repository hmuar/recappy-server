import request from 'request-promise';
import Config from '~/config/config';
import { log } from '~/logger';
import MessageType from './fbmessage_type';

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

function sendPostRequest(body) {
  const options = {
    json: true,
    url: `https://graph.facebook.com/v2.6/me/messages?access_token=${Config.FBToken}`,
    body,
  };
  return request.post(options);
}

export function sendText(senderID, text) {
  log(`sending text: ${text}`);
  const bodyCreator = postBodyCreator(MessageType.TEXT);
  return sendPostRequest(bodyCreator(senderID, text));
}

// buttons is list of {title, action}
export function sendButtons(senderID, text, buttons) {
  log(`sending buttons: ${text}`);
  const bodyCreator = postBodyCreator(MessageType.POSTBACK);
  return sendPostRequest(bodyCreator(senderID, text, buttons));
}

export function sendImage(senderID, imgURL) {
  log(`sending img: ${imgURL}`);
  const bodyCreator = postBodyCreator(MessageType.IMAGE);
  return sendPostRequest(bodyCreator(senderID, imgURL));
}
