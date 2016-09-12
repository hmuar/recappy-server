import Input from '~/core/input';
import { SessionState } from '~/core/session_state';
import generateQuestion from '~/speech';
import Answer from '~/core/answer';
import { sendText, sendButtons, sendImage } from './fbmessenger_request';

export function sendPossibleImage(senderID, note) {
  if ('imgUrl' in note) {
    if (note.imgUrl != null) {
      sendImage(senderID, note.imgUrl);
    }
  }
}

export default function sendResponse(state) {
  const fbUserID = state.senderID;
  const session = state.session;
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
    case SessionState.DONE_QUEUE:
      sendText(fbUserID,
        'No more to learn for today, all done! Check back in tomorrow :)');
      break;

    default:
      break;
  }
  return state;
}

function posFeedback() {
  return 'Great job!';
}

function negFeedback() {
  return 'Not quite :(';
}

function sendFeedbackText(toID, isPositive, correctMsg = null) {
  let msg = isPositive ? posFeedback() : negFeedback();
  if (!isPositive && correctMsg) {
    msg = `${msg} It's actually - ${correctMsg}`;
  }
  sendText(toID, msg);
}

export function sendFeedbackResp(state) {
  const fbUserID = state.senderID;
  const isCorrect = state.evalCtx.answerQuality === Answer.max;
  const session = state.session;
  switch (session.state) {
    case SessionState.RECALL_RESPONSE:
    case SessionState.INPUT:
    case SessionState.MULT_CHOICE:
      sendFeedbackText(fbUserID, isCorrect, state.evalCtx.correctAnswer);
      break;
    default:
      break;
  }

  return state;
}
