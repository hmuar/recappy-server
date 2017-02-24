import Config from '~/config/config';
import { log } from '~/logger';
import MessageType from '~/adapter/fbmessenger/fbmessage_type';

const FB_REQUEST_URL = `https://graph.facebook.com/v2.6/me/messages?access_token=${Config.FBToken}`;

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

function getReplyBody(text, replies = []) {
  if (!replies || replies.length === 0) {
    return {
      text,
    };
  }

  const replyData = replies.map((reply) => (
    {
      content_type: 'text',
      title: reply.title,
      payload: reply.action,
    }
  ));

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
  if (msgType === MessageType.QUICK_REPLY) {
    return (senderID, messages) => {
      const req = getReqBodyTemplate(senderID);
      req.message = messages.map(
        (msg) => getReplyBody(msg.text, msg.replies)
      );
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

export function sendMessages(senderID, messages) {
  const bodyCreator = postBodyCreator(MessageType.QUICK_REPLY);
  return bodyCreator(senderID, messages);
}

export function sendImage(senderID, imgURL) {
  log(`sending img: ${imgURL}`);
  const bodyCreator = postBodyCreator(MessageType.IMAGE);
  return bodyCreator(senderID, imgURL);
}
