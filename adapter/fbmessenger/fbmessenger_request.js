import request from 'request';
import MessageType from './fbmessage_type';
import Config from '../../config/config';

function postBodyCreator(msgType) {
  if(msgType == MessageType.TEXT) {
    return (senderID, text) => {
      let req = getReqBodyTemplate(senderID);
      req.message = getReqTextBody(text);
      return req;
    }
  }
  else if(msgType == MessageType.POSTBACK) {
    // buttons is a list of {title, action}
    return (senderID, text, buttons) => {
      let req = getReqBodyTemplate(senderID);
      req.message = getReqPayloadBody(text, buttons);
      return req;
    };
  }
  else if(msgType == MessageType.IMAGE) {
    return (senderID, imgUrl) => {
      let req = getReqBodyTemplate(senderID);
      req.message = getReqImageBody(imgUrl);
      return req;
    }
  }
  else {
    return null;
  }
}

function getReqImageBody(imgUrl) {
  return {
    "attachment":{
      "type":"image",
      "payload":{
        "url": imageUrl
      }
    }
  }
}

function getReqPayloadBody(text, buttons) {
  let btnData = buttons.map((btn) => {
    return {
      type: "postback",
      title: btn.title,
      payload: btn.action
    }
  });

  return {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "button",
        "text": text,
        "buttons": btnData
      }
    }
  }
}

function getReqTextBody(text) {
  return {
    "text": text
  }
}

function getReqBodyTemplate(senderID) {
  return {
    "recipient": {
      "id": senderID,
    },
    "message": {}
  }
}

function sendPostRequest(body, callback) {
  let options = {
    json: true,
    url: 'https://graph.facebook.com/v2.6/me/messages?access_token='+Config.FBToken,
    body
  };
  request.post(options, callback);
}

export function sendText(senderID, text, callback) {
  let bodyCreator = postBodyCreator(MessageType.TEXT);
  sendPostRequest(bodyCreator(senderID, text), callback);
}

// buttons is list of {title, action}
export function sendButtons(senderID, text, buttons, callback) {
  let bodyCreator = postBodyCreator(MessageType.POSTBACK);
  sendPostRequest(bodyCreator(senderID, text, buttons), callback);
}

export function sendImage(senderID, imgUrl, callback) {
  let bodyCreator = postBodyCreator(MessageType.IMAGE);
  sendPostRequest(bodyCreator(senderID, imgUrl), callback);
}
