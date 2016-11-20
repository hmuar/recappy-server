import { SessionState,
         getEntryStateForNoteType,
         getPaths } from '~/core/session_state';
import Input from '~/core/input';
import { getNextNotes, TARGET_NUM_NOTES_IN_SESSION } from '~/core/scheduler';
import { EvalStatus, isFailResponse } from '~/core/eval';

// Given current info in app state, determine next study state for user.
// Only need to look at current session state to determine next state.

// set current app state as the pre eval state
function setPreEvalState(appState) {
  if (!appState.session || !appState.session.state) {
    return appState;
  }
  return {
    ...appState,
    preEvalState: appState.session.state,
  };
}

function isValidEval(appState) {
  if (!appState || !appState.evalCtx) {
    return false;
  }
  return appState.evalCtx.status !== EvalStatus.INVALID;
}

function setPostEvalState(appState) {
  if (!appState.session || !appState.session.state ||
      !appState.evalCtx) {
    return appState;
  }

  const sessionState = appState.session.state;
  let postEvalState = sessionState;
  const validEval = isValidEval(appState);

  switch (sessionState) {
    case SessionState.INIT:
      if (validEval) {
        postEvalState = SessionState.START_QUEUE;
      }
      break;
    case SessionState.RECALL:
      if (validEval) {
        postEvalState = SessionState.RECALL_RESPONSE;
      }
      break;
    case SessionState.SHOW_PATHS:
      if (validEval) {
        postEvalState = SessionState.WAIT_NEXT_IN_QUEUE;
      }
      break;
    case SessionState.INFO:
    case SessionState.INPUT:
    case SessionState.RECALL_RESPONSE:
    case SessionState.MULT_CHOICE:
      if (validEval) {
        // if min quality response, check for possible note paths
        if (isFailResponse(appState.evalCtx.answerQuality)) {
          const paths = getPaths(appState.session);
          postEvalState = paths ? SessionState.SHOW_PATHS :
            SessionState.WAIT_NEXT_IN_QUEUE;
        } else {
          postEvalState = SessionState.WAIT_NEXT_IN_QUEUE;
        }
      }
      break;
    default:
      break;
  }

  return {
    ...appState,
    postEvalState,
  };
}

// if postEvalState === WAIT_NEXT_IN_QUEUE, need to advance noteQueue, next state
function advanceState(appState) {
  if (!appState) {
    return appState;
  }
  // if necessary, advance queueIndex
  // set proper next state based on next note
  if (appState.session && appState.postEvalState) {
    if (appState.postEvalState === SessionState.DONE_QUEUE) {
      // update note queue
      // update queueIndex
      // update globalIndex
      // export function getNextNotes(userID, subjectID, numNotes, lastGlobalIndex) {
      const { userID, subjectID } = appState;
      // XXX: Temp hardcode global index to 0
      // const nextGlobalIndex = 0;
      const nextGlobalIndex = appState.session.globalIndex + 1;

      // XXX Dev loophole to allow date control
      // Check if user input was a number. If so, treat it as an offset
      // for number of days from current Date, and then use that date
      // as cutoff date when getting next note queue from scheduler.
      const cutoffDate = new Date();
      const input = appState.input;
      if (input.type === Input.Type.CUSTOM) {
        const tryInt = parseInt(input.payload, 10);
        if (!isNaN(tryInt)) {
          cutoffDate.setDate(cutoffDate.getDate() + tryInt);
        }
      }

      return getNextNotes(userID,
                   subjectID,
                   nextGlobalIndex,
                   TARGET_NUM_NOTES_IN_SESSION,
                   cutoffDate)
      .then(nextNotesArray => {
        // const [oldNotes, newNotes] = nextNotesArray;
        // const nextNotes = oldNotes.concat(newNotes);
        const nextNotes = nextNotesArray;
        if (nextNotes && nextNotes.length > 0) {
          return {
            ...appState,
            postEvalState: null,
            session: {
              ...appState.session,
              noteQueue: nextNotes,
              queueIndex: 0,
              globalIndex: nextGlobalIndex,
              baseQueueLength: nextNotes.length,
              state: getEntryStateForNoteType(nextNotes[0].type),
            },
          };
        }
        // no new notes exist, user has finished everything.
        return appState;
      });
    }

    if (appState.postEvalState === SessionState.WAIT_NEXT_IN_QUEUE ||
        appState.postEvalState === SessionState.START_QUEUE) {
      const { queueIndex, noteQueue } = appState.session;
      let nextSessionState = appState.postEvalState;
      let nextQueueIndex = queueIndex;

      if (noteQueue && queueIndex != null) {
        // only advance queue if waiting for next in queue
        // (e.g. shouldn't advance note if we are just START_QUEUE)
        if (appState.postEvalState === SessionState.WAIT_NEXT_IN_QUEUE) {
          nextQueueIndex = queueIndex + 1;
        }
        if (nextQueueIndex < noteQueue.length) {
          const nextNote = noteQueue[nextQueueIndex];
          nextSessionState = getEntryStateForNoteType(nextNote.type);
        } else {
          nextSessionState = SessionState.DONE_QUEUE;
        }
      }

      return {
        ...appState,
        session: {
          ...appState.session,
          queueIndex: nextQueueIndex,
          state: nextSessionState,
        },
      };
    }

    if (appState.postEvalState) {
      return {
        ...appState,
        session: {
          ...appState.session,
          state: appState.postEvalState,
        },
      };
    }
  }

  return appState;
}

export default function pipe(appState) {
  let nextAppState = setPreEvalState(appState);
  nextAppState = setPostEvalState(nextAppState);
  nextAppState = advanceState(nextAppState);
  return nextAppState;
}
