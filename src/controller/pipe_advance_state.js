import { SessionState,
         getEntryStateForNoteType } from '../core/session_state';

import { getNextNotes, TARGET_NUM_NOTES_IN_SESSION } from '../core/scheduler';

// Given current info in app state, determine next study state for user.
// Only need to look at current app state and evalCtx to determine next state.

function setNextState(appState) {
  if (!appState.session || !appState.session.state ||
      !appState.evalCtx) {
    return appState;
  }

  const sessionState = appState.session.state;
  const { doneContext } = appState.evalCtx;
  let nextState = sessionState;

  switch (sessionState) {
    case SessionState.INIT:
      if (doneContext) {
        nextState = SessionState.START_QUEUE;
      }
      break;
    case SessionState.INFO:
    case SessionState.RECALL:
    case SessionState.RECALL_RESPONSE:
    case SessionState.INPUT:
    case SessionState.MULT_CHOICE:
      if (doneContext) {
        nextState = SessionState.WAIT_NEXT_IN_QUEUE;
      }
      break;
    default:
      break;
  }

  return {
    ...appState,
    nextState,
  };
}

// if nextState === WAIT_NEXT_IN_QUEUE, need to advance noteQueue, next state
function advanceState(appState) {
  if (!appState) {
    return appState;
  }
  // if necessary, advance queueIndex
  // set proper next state based on next note
  if (appState.session && appState.nextState) {
    if (appState.nextState === SessionState.DONE_QUEUE) {
      // update note queue
      // update queueIndex
      // update globalIndex
      // export function getNextNotes(userID, subjectID, numNotes, lastGlobalIndex) {
      const { userID, subjectID } = appState;
      return getNextNotes(userID,
                   subjectID,
                   TARGET_NUM_NOTES_IN_SESSION,
                   appState.session.globalIndex)
      .then(nextNotesArray => {
        const [oldNotes, newNotes] = nextNotesArray;
        const nextNotes = oldNotes.concat(newNotes);
        if (nextNotes && nextNotes.length > 0) {
          return {
            ...appState,
            nextState: null,
            session: {
              ...appState.session,
              noteQueue: nextNotes,
              queueIndex: 0,
              globalIndex: appState.session.globalIndex + 1,
              state: getEntryStateForNoteType(nextNotes[0].type),
            },
          };
        }
        // no new notes exist, user has finished everything.
        return appState;
      });
    }

    if (appState.nextState === SessionState.WAIT_NEXT_IN_QUEUE ||
        appState.nextState === SessionState.START_QUEUE) {
      const { queueIndex, noteQueue } = appState.session;
      let nextSessionState = appState.nextState;
      let nextQueueIndex = queueIndex;

      if (noteQueue && queueIndex != null) {
        // only advance queue if waiting for next in queue
        // (e.g. shouldn't advance note if we are just START_QUEUE)
        if (appState.nextState === SessionState.WAIT_NEXT_IN_QUEUE) {
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
    if (appState.nextState) {
      return {
        ...appState,
        session: {
          ...appState.session,
          state: appState.nextState,
        },
      };
    }
  }

  return appState;
}

export default function pipe(appState) {
  let nextAppState = setNextState(appState);
  nextAppState = advanceState(nextAppState);
  return nextAppState;
}
