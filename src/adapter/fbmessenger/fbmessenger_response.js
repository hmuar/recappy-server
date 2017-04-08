import Input, { getChoiceInput, getPathInput } from '~/core/input';
import { SessionState } from '~/core/session_state';
import generateQuestion from '~/speech';
import Answer from '~/core/answer';
import { logErr } from '~/logger';
import { sendText, sendImage, sendQuickReply } from './fbmessenger_request';

export function sendPossibleImage(senderID, note) {
  if ('imgUrl' in note) {
    if (note.imgUrl != null) {
      return sendImage(senderID, note.imgUrl);
    }
  }
  return Promise.resolve(0);
}

function sendResponseInContext(state) {
  const fbUserID = state.senderID;
  const session = state.session;
  const note = session.noteQueue[session.queueIndex];
  switch (session.state) {
    case SessionState.INIT:
      return sendText(fbUserID, "Let's get started!").then(() => state);

    case SessionState.INFO: {
      const quickReplyData = [];
      quickReplyData.push({
        title: 'Ok keep going',
        action: Input.Type.ACCEPT,
      });
      return sendPossibleImage(fbUserID, note).then(() =>
        sendQuickReply(fbUserID, note.displayRaw, quickReplyData));
    }

    case SessionState.RECALL: {
      const quickReplyData = [];
      quickReplyData.push({
        title: 'Tell me the answer',
        action: Input.Type.ACCEPT,
      });
      const questionText = generateQuestion(note);
      return sendPossibleImage(fbUserID, note).then(() =>
        sendQuickReply(fbUserID, questionText, quickReplyData));
    }

    case SessionState.RECALL_RESPONSE: {
      const quickReplyData = [];
      quickReplyData.push({
        title: 'Yes',
        action: Input.Type.ACCEPT,
      });
      quickReplyData.push({
        title: 'No',
        action: Input.Type.REJECT,
      });
      return sendPossibleImage(fbUserID, note)
        .then(() => sendText(fbUserID, note.hidden))
        .then(() => sendQuickReply(fbUserID, 'Is that what you were thinking?', quickReplyData));
    }

    case SessionState.INPUT: {
      const questionText = generateQuestion(note);
      return sendPossibleImage(fbUserID, note).then(() => sendText(fbUserID, questionText));
    }

    case SessionState.MULT_CHOICE: {
      const questionText = generateQuestion(note);
      return sendPossibleImage(fbUserID, note)
        .then(() => sendText(fbUserID, questionText))
        .then(() => {
          let choicesText = '';
          choicesText += `(1) ${note.choice1}\n`;
          choicesText += `(2) ${note.choice2}\n`;
          choicesText += `(3) ${note.choice3}\n`;
          choicesText += `(4) ${note.choice4}\n`;
          choicesText += `(5) ${note.choice5}`;
          const quickReplyData = [1, 2, 3, 4, 5].map(num => ({
            title: `${num}`,
            action: getChoiceInput(num),
          }));
          return sendQuickReply(fbUserID, choicesText, quickReplyData);
        });
    }

    case SessionState.SHOW_PATHS: {
      if (!state.paths) {
        return Promise.resolve(0);
      }
      const quickReplyData = state.paths.map(path => ({
        title: path.display,
        action: getPathInput(path.index),
      }));
      return sendQuickReply(fbUserID, 'Where to from here?', quickReplyData);
    }

    case SessionState.DONE_QUEUE:
      return sendText(fbUserID, 'No more to learn for today, all done! Check back in tomorrow :)');

    default:
      logErr(`Unrecognized state ${session.state}, could not properly respond`);
      return Promise.resolve(0);
  }
}

export default function sendResponse(state) {
  return sendResponseInContext(state).then(() => state).catch(err => {
    if (state.session) {
      logErr(`Error sending response from ${state.session.state} state`);
    } else {
      logErr('Error sending response');
    }
    logErr(err);
  });
}

function posFeedback() {
  return 'Great job!';
}

function negFeedback() {
  return 'Not quite :(\n';
}

function sendFeedbackText(toID, isPositive, correctMsg = null) {
  let msg = isPositive ? posFeedback() : negFeedback();
  if (!isPositive && correctMsg) {
    msg = `${msg} It's actually ${correctMsg}`;
  }
  return sendText(toID, msg);
}

// return state
export function sendFeedbackResp(state) {
  const fbUserID = state.senderID;
  const isCorrect = state.evalCtx.answerQuality === Answer.max;
  const session = state.session;
  switch (session.state) {
    case SessionState.RECALL_RESPONSE:
    case SessionState.INPUT:
    case SessionState.MULT_CHOICE:
      return sendFeedbackText(fbUserID, isCorrect, state.evalCtx.correctAnswer).then(() => state);
    default:
      break;
  }

  return state;
}
