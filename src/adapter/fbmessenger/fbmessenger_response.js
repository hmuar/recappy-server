import { SessionState, getCurrentNote } from '~/core/session_state';
import Input, { getChoiceInput, getPathInput } from '~/core/input';
import { isValidEval, isFailResponse } from '~/core/eval';
import { divideLongText } from '~/core/text_utils';

import {
  generateQuestion,
  backToOriginalTopic,
  positiveEncourage,
  negativeEncourage,
  triggerFollowup,
  wrongAnswer,
  welcomeBack,
  doneSession,
  keepGoing,
  isThatWhatYouThought,
  theAnswerWas
} from '~/speech';
import Answer from '~/core/answer';
import { logErr } from '~/logger';
import { Media } from '~/db/collection';
import { NoteType } from '~/core/note';
import CategoryAssistant from '~/db/category_assistant';
import { sendText, sendImage, sendQuickReply, sendButtons } from './fbmessenger_request';

function continuePhrase() {
  return keepGoing();
}

function sendImageWithUrl(senderID, imgUrl) {
  if (!imgUrl) {
    return Promise.resolve(0);
  }
  return sendImage(senderID, imgUrl);
}

export function sendPossibleImage(senderID, note) {
  if ('imgUrl' in note) {
    if (note.imgUrl != null) {
      return sendImageWithUrl(senderID, note.imgUrl);
    }
  }
  return Promise.resolve(0);
}

function prependPendingMessages(appState, msg) {
  if (appState.transitionFromPathToMain) {
    const curNote = getCurrentNote(appState.session);
    const curNoteParent = curNote.directParent;
    return CategoryAssistant.getCategoryById(curNoteParent).then(
      parent => `${backToOriginalTopic(parent.ckey)} ${msg}`
    );
  }
  return Promise.resolve(msg);
}

function sendResponseInContext(state) {
  const fbUserID = state.senderID;
  const session = state.session;
  const note = session.noteQueue[session.queueIndex];
  switch (session.state) {
    // case SessionState.INIT:
    //   return sendText(fbUserID, "Let's get started!").then(() => state);

    case SessionState.INFO: {
      // split up displayRaw text into separate bubbles of text
      const displayText = note.displayRaw;
      let quickReplyData = [];

      if (state.paths) {
        quickReplyData = [
          ...state.paths.map(path => ({
            title: path.display,
            action: getPathInput(path.index),
          }))
        ];
      }

      quickReplyData.push({
        title: continuePhrase(),
        action: Input.Type.ACCEPT,
      });

      return sendPossibleImage(fbUserID, note)
        .then(() => prependPendingMessages(state, displayText))
        .then(finalMsg => {
          const shortenedMsgs = divideLongText(finalMsg, 100);
          if (shortenedMsgs.length > 1) {
            return sendText(fbUserID, shortenedMsgs[0]).then(() =>
              sendQuickReply(fbUserID, shortenedMsgs[1], quickReplyData));
          }
          return sendQuickReply(fbUserID, finalMsg, quickReplyData);
        });
    }

    case SessionState.RECALL: {
      const quickReplyData = [];
      quickReplyData.push({
        title: 'Tell me the answer',
        action: Input.Type.ACCEPT,
      });
      const questionText = generateQuestion(note);

      return sendPossibleImage(fbUserID, note)
        .then(() => prependPendingMessages(state, questionText))
        .then(finalMsg =>
          sendQuickReply(
            fbUserID,
            `${finalMsg} Think about it to yourself and we'll look at the answer together.`,
            quickReplyData
          ));
    }

    case SessionState.RECALL_RESPONSE: {
      const quickReplyData = [];
      quickReplyData.push({
        title: 'Yep',
        action: Input.Type.ACCEPT,
      });
      quickReplyData.push({
        title: 'Nope',
        action: Input.Type.REJECT,
      });
      return sendText(fbUserID, note.hidden).then(() =>
        sendQuickReply(fbUserID, isThatWhatYouThought(), quickReplyData));
    }

    case SessionState.INPUT: {
      const questionText = generateQuestion(note);
      return sendPossibleImage(fbUserID, note)
        .then(() => prependPendingMessages(state, questionText))
        .then(finalMsg => sendText(fbUserID, finalMsg));
    }

    case SessionState.MULT_CHOICE: {
      const questionText = generateQuestion(note);
      return sendPossibleImage(fbUserID, note)
        .then(() => prependPendingMessages(state, questionText))
        .then(finalMsg => sendText(fbUserID, finalMsg))
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
      let displayText = '';
      if (note.type === NoteType.INFO) {
        displayText = note.displayRaw;
      }
      const quickReplyData = [
        ...state.paths.map(path => ({
          title: path.display,
          action: getPathInput(path.index),
        })),
        {
          title: continuePhrase(),
          action: Input.Type.ACCEPT,
        }
      ];
      return sendQuickReply(fbUserID, displayText, quickReplyData);
    }

    case SessionState.DONE_QUEUE:
      if (
        state.preEvalState === SessionState.DONE_QUEUE &&
        state.postEvalState === SessionState.DONE_QUEUE
      ) {
        const waitedHours = session.remainingWaitHours;
        let respMessage = "Whew I'm tired! 😓 We already learned a lot today, don't ya think? Let's take a break! An important part of learning is resting and letting the new stuff sink in.";
        if (waitedHours) {
          const hoursMsg = waitedHours > 1 ? `${waitedHours}ish hours` : 'about an hour or two';
          respMessage = `${respMessage} Why don't we chat again in ${hoursMsg}? Nap time for me. 😴`;
        }
        return sendText(fbUserID, respMessage);
      }

      return Media.aggregate([{ $sample: { size: 1, }, }]).then(result => {
        let img = '';
        if (result && result.length) {
          img = result[0].url;
          return sendImageWithUrl(fbUserID, img).then(() => sendText(fbUserID, doneSession()));
        }
        return sendText(fbUserID, doneSession());
      });

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

function posFeedback(correctMsg) {
  const positiveEncourageMsg = positiveEncourage();
  const answerWasPhrase = theAnswerWas();
  return `${positiveEncourageMsg} ${answerWasPhrase} '${correctMsg}'`;
}

function negFeedback(state, correctMsg) {
  if (state.session.state === SessionState.RECALL_RESPONSE) {
    return negativeEncourage();
  }
  return wrongAnswer(correctMsg);
}

function getTriggerResponse(note, inputText) {
  console.log('trying to get trigger response..........');
  const responses = note.responses;
  if (!responses || !responses.length) {
    return null;
  }
  for (let i = 0; i < responses.length; i++) {
    const response = responses[i];
    console.log(`looking at response with trigger ${response.trigger}`);
    if (response.trigger === inputText) {
      console.log(`found trigger response! returning ${response.display}`);
      return response.display;
    }
  }
  return null;
}

function sendFeedbackText(state, withTriggerResponse = false, withSuccessMedia = false) {
  const toID = state.senderID;

  if (!isValidEval(state.evalCtx)) {
    return sendText(
      toID,
      "I didn't understand your answer 😕 can you try to tell me in a different way? Let me repeat and let's try again."
    );
  }

  const isPositive = !isFailResponse(state.evalCtx.answerQuality);
  const correctMsg = state.evalCtx.correctAnswer;

  let msg = isPositive ? posFeedback(correctMsg) : negFeedback(state);
  if (!isPositive) {
    const curNote = getCurrentNote(state.session);
    if (withTriggerResponse) {
      const inputText = state.input.payload;
      const triggerResp = getTriggerResponse(curNote, inputText);
      if (triggerResp && correctMsg) {
        msg = triggerFollowup(correctMsg);
        msg = `${triggerResp}. ${msg}`;
      } else if (curNote.hidden) {
        if (correctMsg) {
          msg = negFeedback(state, correctMsg);
        }
        msg = `${msg}. ${curNote.hidden}`;
      }
    }
    // if (withTriggerResponse && curNote.hidden) {
    // }
    // const quickReplyData = [{ title: 'Wait you misunderstood me', action: Input.Type.CHALLENGE, }];
    // const buttonData = [
    //   {
    //     title: "That's what I said!",
    //     action: Input.Type.CHALLENGE,
    //   }
    // ];
    //
    // return sendQuickReply(toID, msg, quickReplyData);
    // return sendButtons(toID, msg, buttonData);
    return sendText(toID, msg);
  }
  // try to send a success GIF
  if (withSuccessMedia) {
    return Media.aggregate([{ $sample: { size: 1, }, }]).then(result => {
      let img = '';
      if (result && result.length) {
        img = result[0].url;
        return sendImageWithUrl(toID, img).then(() => sendText(toID, msg));
      }
      return sendText(toID, msg);
    });
  }
  return sendText(toID, msg);
}

function sendDoneQueueFeedback(appState) {
  const { answerQuality, correctAnswer, } = appState.evalCtx;
  const isPositive = answerQuality === Answer.max;

  if (isPositive) {
    const toID = appState.senderID;
    return sendText(toID, welcomeBack());
  }
  return Promise.resolve(appState);
}

// return state
export function sendFeedbackResp(state, withSuccessMedia = false) {
  const session = state.session;
  switch (session.state) {
    case SessionState.INTRO: {
      const toID = state.senderID;
      const msg = "Hey! 🤗 Have you ever tried to learn something and then realize later you forgot everything? Learning the right way can be tough on your own. That's why I'm here! Every day we chat we'll learn something new together. Most importantly, we'll always spend some of our time reviewing what we've already learned so we won't forget. Let's go, it's learnin time wooo! 😄";
      return sendText(toID, msg).then(() => state);
    }
    case SessionState.RECALL_RESPONSE:
      return sendFeedbackText(state, false, withSuccessMedia).then(() => state);
    case SessionState.INPUT:
    case SessionState.MULT_CHOICE:
      return sendFeedbackText(state, true, withSuccessMedia).then(() => state);
    case SessionState.DONE_QUEUE:
      return sendDoneQueueFeedback(state).then(() => state);
    default:
      break;
  }

  return state;
}
