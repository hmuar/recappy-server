import { SessionState, getEntryStateForNoteType, getPaths } from '~/core/session_state';
import { getNextNotes, TARGET_NUM_NOTES_IN_SESSION } from '~/core/scheduler';
import { EvalStatus, isFailResponse } from '~/core/eval';

// overwrite entry type recall to recall_response
export function getEntryStateForNoteTypeSim(ntype) {
  switch (ntype) {
    case 'recall':
      return SessionState.RECALL_RESPONSE;
    default:
      return getEntryStateForNoteType(ntype);
  }
}

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
  if (!appState.session || !appState.session.state || !appState.evalCtx) {
    return appState;
  }

  const sessionState = appState.session.state;
  let postEvalState = sessionState;
  const validEval = isValidEval(appState);

  switch (sessionState) {
    case SessionState.INTRO:
    case SessionState.INIT:
      if (validEval) {
        postEvalState = SessionState.START_QUEUE;
      }
      break;
    case SessionState.RECALL:
      throw new Error('Should never end up in the RECALL state when using the simulator.');
    // if (validEval) {
    //   postEvalState = SessionState.WAIT_NEXT_IN_QUEUE;
    // }
    // break;
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
          // const paths = getPaths(appState.session);
          // postEvalState = paths ? SessionState.SHOW_PATHS : SessionState.WAIT_NEXT_IN_QUEUE;
          postEvalState = SessionState.WAIT_NEXT_IN_QUEUE;
        } else {
          postEvalState = SessionState.WAIT_NEXT_IN_QUEUE;
        }
      }
      break;
    default:
      break;
  }

  // if state === DONE_QUEUE, will end up here, since
  // postEvalState should be DONE_QUEUE as well

  return {
    ...appState,
    postEvalState,
  };
}

// if postEvalState === WAIT_NEXT_IN_QUEUE, need to advance noteQueue, next state
function advanceState(appState) {
  if (!appState) {
    return Promise.resolve(appState);
  }

  // if necessary, advance queueIndex
  // set proper next state based on next note
  if (appState.session && appState.postEvalState) {
    if (appState.postEvalState === SessionState.DONE_QUEUE) {
      // update note queue
      // update queueIndex
      // update globalIndex
      const { userID, subjectID, session, } = appState;
      const nextGlobalIndex = session.nextGlobalIndex;

      const sessionSimulator = session.simulator;
      const newDayOffset = sessionSimulator.dayOffset + 1;

      // Advance days and use it as an offset from current date. Then use that
      // as cutoff date when getting next note queue from scheduler.
      // const cutoffDate = new Date(appState.timestamp);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() + newDayOffset);

      return getNextNotes(
        userID,
        subjectID,
        nextGlobalIndex,
        TARGET_NUM_NOTES_IN_SESSION,
        cutoffDate
      ).then(notesInfo => {
        const nextNotes = notesInfo.notes;
        if (nextNotes && nextNotes.length > 0) {
          return {
            ...appState,
            // postEvalState: null,
            session: {
              ...appState.session,
              noteQueue: nextNotes,
              queueIndex: 0,
              simulator: {
                ...sessionSimulator,
                dayOffset: newDayOffset,
              },
              globalIndex: notesInfo.globalIndex,
              nextGlobalIndex: notesInfo.nextGlobalIndex,
              baseQueueLength: nextNotes.length,
              state: getEntryStateForNoteTypeSim(nextNotes[0].type),
            },
          };
        }
        // no new notes exist, user has finished everything.
        return appState;
      });
    }

    if (
      appState.postEvalState === SessionState.WAIT_NEXT_IN_QUEUE ||
      appState.postEvalState === SessionState.START_QUEUE
    ) {
      const { queueIndex, noteQueue, } = appState.session;
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
          nextSessionState = getEntryStateForNoteTypeSim(nextNote.type);
        } else {
          nextSessionState = SessionState.DONE_QUEUE;
        }
      }

      return Promise.resolve({
        ...appState,
        session: {
          ...appState.session,
          queueIndex: nextQueueIndex,
          state: nextSessionState,
        },
      });
    }

    if (appState.postEvalState) {
      return Promise.resolve({
        ...appState,
        session: {
          ...appState.session,
          state: appState.postEvalState,
        },
      });
    }
  }

  return Promise.resolve(appState);
}

export default function pipe(appState) {
  let nextAppState = setPreEvalState(appState);
  nextAppState = setPostEvalState(nextAppState);
  nextAppState = advanceState(nextAppState).then(state => state);
  return nextAppState;
}
