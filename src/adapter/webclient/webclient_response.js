import Input, { getChoiceInput, getPathInput } from '~/core/input';
import { SessionState, getCurrentNote } from '~/core/session_state';
import { generateQuestion } from '~/speech';
import Answer from '~/core/answer';
import { logErr } from '~/logger';
import { sendMessages, sendImage } from './webclient_request';
import { Media } from '~/db/collection';

// export function sendPossibleImage(senderID, note) {
//   if ('imgUrl' in note) {
//     if (note.imgUrl != null) {
//       return sendImage(senderID, note.imgUrl);
//     }
//   }
//   return {};
// }

function extractFeedbackResp(feedback) {
  if (feedback && feedback.message) {
    return feedback.message.filter(msg => msg.text || msg.img);
  }
  return [];
}

function sendResponseInContext(state) {
  const fbUserID = state.senderID;
  const session = state.session;
  const note = session.noteQueue[session.queueIndex];
  const preResponses = extractFeedbackResp(state.feedback);
  switch (session.state) {
    case SessionState.INIT: {
      const response = sendMessages(fbUserID, [
        {
          text: "Let's get started!",
          replies: [],
          img: note.imgUrl ? note.imgUrl : '',
        }
      ]);
      return Promise.resolve([response]);
    }

    case SessionState.INFO: {
      const quickReplyData = [];
      quickReplyData.push({
        title: 'Ok keep going',
        action: Input.Type.ACCEPT,
      });
      // const response = sendPossibleImage(fbUserID, note);
      const response = sendMessages(fbUserID, [
        ...preResponses,
        {
          text: note.display,
          replies: quickReplyData,
          img: note.imgUrl ? note.imgUrl : '',
        }
      ]);
      return Promise.resolve([response]);
    }

    case SessionState.RECALL: {
      const quickReplyData = [];
      quickReplyData.push({
        title: 'Tell me the answer',
        action: Input.Type.ACCEPT,
      });
      const questionText = generateQuestion(note);
      // return sendPossibleImage(fbUserID, note)
      const response = sendMessages(fbUserID, [
        ...preResponses,
        {
          text: questionText,
          replies: quickReplyData,
          img: note.imgUrl ? note.imgUrl : '',
        }
      ]);
      return Promise.resolve([response]);
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
      // return sendPossibleImage(fbUserID, note)
      const quickReplyText = 'Is that what you were thinking?';
      const response = sendMessages(fbUserID, [
        ...preResponses,
        {
          text: note.hidden,
          replies: [],
          img: note.imgUrl ? note.imgUrl : '',
        },
        {
          text: quickReplyText,
          replies: quickReplyData,
        }
      ]);
      return Promise.resolve([response]);
    }

    case SessionState.INPUT: {
      const questionText = generateQuestion(note);
      // return sendPossibleImage(fbUserID, note)
      const response = sendMessages(fbUserID, [
        ...preResponses,
        {
          text: questionText,
          replies: [],
          img: note.imgUrl ? note.imgUrl : '',
        }
      ]);
      return Promise.resolve([response]);
    }

    case SessionState.MULT_CHOICE: {
      const questionText = generateQuestion(note);
      // return sendPossibleImage(fbUserID, note)
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
      const response = sendMessages(fbUserID, [
        ...preResponses,
        {
          text: questionText,
          replies: [],
          img: note.imgUrl ? note.imgUrl : '',
        },
        {
          text: choicesText,
          replies: quickReplyData,
        }
      ]);
      return Promise.resolve([response]);
    }

    case SessionState.SHOW_PATHS: {
      if (!state.paths || state.paths.length === 0) {
        return Promise.resolve(0);
      }
      const quickReplyData = [
        ...state.paths.map(path => ({
          title: path.display,
          action: getPathInput(path.index),
        })),
        {
          title: 'Ok keep going',
          action: Input.Type.ACCEPT,
        }
      ];

      const response = sendMessages(fbUserID, [
        ...preResponses,
        {
          text: 'Where to from here?',
          replies: quickReplyData,
        }
      ]);
      return Promise.resolve([response]);
    }

    case SessionState.DONE_QUEUE: {
      const response = sendMessages(fbUserID, [
        ...preResponses,
        {
          text: 'No more to learn for today, all done! Check back in tomorrow :)',
          replies: [],
        }
      ]);
      return Promise.resolve([response]);
    }

    default:
      logErr(`Unrecognized state ${session.state}, could not properly respond`);
      return Promise.resolve(0);
  }
}

export default function sendResponse(state) {
  return (
    sendResponseInContext(state)
      // .then(() => state)
      .catch(err => {
        if (state.session) {
          logErr(`Error sending response from ${state.session.state} state`);
        } else {
          logErr('Error sending response');
        }
        logErr(err);
      })
  );
}

function posFeedback() {
  return 'Great job!';
}

function negFeedback() {
  return 'Not quite :(';
}

function sendFeedbackText(state, withHiddenContent = false, withSuccessMedia = false) {
  const toID = state.senderID;
  const isPositive = state.evalCtx.answerQuality === Answer.max;
  const correctMsg = state.evalCtx.correctAnswer;

  let msg = isPositive ? posFeedback() : negFeedback();
  if (!isPositive) {
    if (correctMsg) {
      msg = `${msg} It's actually ${correctMsg}`;
    }
    const curNote = getCurrentNote(state.session);
    if (withHiddenContent && curNote.hidden) {
      msg = `${msg}. ${curNote.hidden}`;
    }
    return Promise.resolve(
      sendMessages(toID, [
        {
          text: msg,
          replies: [],
        }
      ])
    );
  }
  if (withSuccessMedia) {
    return Media.aggregate([{ $sample: { size: 1, }, }]).then(result => {
      let img = '';
      if (result && result.length) {
        img = result[0].url;
      }
      return sendMessages(toID, [
        {
          text: msg,
          replies: [],
          img,
        }
      ]);
    });
  }
  return Promise.resolve(
    sendMessages(toID, [
      {
        text: msg,
        replies: [],
      }
    ])
  );
}

// return state
export function sendFeedbackResp(state, withSuccessMedia = false) {
  const session = state.session;
  switch (session.state) {
    case SessionState.RECALL_RESPONSE:
      return sendFeedbackText(state, false, withSuccessMedia).then(feedback => ({
        ...state,
        feedback,
      }));
    case SessionState.INPUT:
    case SessionState.MULT_CHOICE:
      return sendFeedbackText(state, true, withSuccessMedia).then(feedback => ({
        ...state,
        feedback,
      }));
    // return sendFeedbackText(fbUserID, isCorrect, state.evalCtx.correctAnswer)
    //       .then(() => state);
    default:
      break;
  }
  return state;
}
