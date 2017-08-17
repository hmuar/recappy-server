import { SessionState, getEntryStateForNoteType, QueueStatus } from '~/core/session_state';
import { getNextNotes, TARGET_NUM_NOTES_IN_SESSION } from '~/core/scheduler';
import { EvalStatus, isFailResponse, hasWaitedMinHours } from '~/core/eval';
import CategoryAssistant from '~/db/category_assistant';

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
      if (validEval) {
        postEvalState = SessionState.RECALL_RESPONSE;
      }
      break;
    case SessionState.DONE_QUEUE:
      if (validEval) {
        const { evalCtx, } = appState;
        postEvalState = isFailResponse(evalCtx.answerQuality)
          ? SessionState.DONE_QUEUE
          : SessionState.START_NEW_SESSION;
      }
      break;
    case SessionState.SHOW_PATHS:
    case SessionState.INFO:
    case SessionState.INPUT:
    case SessionState.RECALL_RESPONSE:
    case SessionState.MULT_CHOICE:
      if (validEval) {
        // if min quality response, check for possible note paths
        // if (isFailResponse(appState.evalCtx.answerQuality)) {
        //   const paths = getPaths(appState.session);
        //   postEvalState = paths ? SessionState.SHOW_PATHS : SessionState.WAIT_NEXT_IN_QUEUE;
        // } else {
        postEvalState = SessionState.WAIT_NEXT_IN_QUEUE;
        // }
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

function advanceToNextConcept(appState, _cutoffDate) {
  const cutoffDate = _cutoffDate || new Date();
  const { userID, subjectID, } = appState;
  const nextGlobalIndex = appState.session.nextGlobalIndex;

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
          globalIndex: notesInfo.globalIndex,
          nextGlobalIndex: notesInfo.nextGlobalIndex,
          baseQueueLength: nextNotes.length,
          state: getEntryStateForNoteType(nextNotes[0].type),
          startSessionTime: new Date(),
        },
      };
    }
    // no new notes exist in entire subject, user has finished EVERYTHING.
    // TODO: add a new session state to handle this situation
    return {
      ...appState,
      // postEvalState: null,
      session: {
        ...appState.session,
        noteQueue: [],
        queueIndex: 0,
        globalIndex: notesInfo.globalIndex,
        nextGlobalIndex: notesInfo.nextGlobalIndex,
        baseQueueLength: 0,
        state: SessionState.DONE_QUEUE,
        startSessionTime: new Date(),
      },
    };
    // return appState;
  });
}

function advanceState(appState) {
  if (!appState) {
    return appState;
  }

  // if necessary, advance queueIndex
  // set proper next state based on next note
  if (appState.session && appState.postEvalState) {
    if (appState.postEvalState === SessionState.DONE_QUEUE) {
      const { evalCtx, } = appState;
      const { correctAnswer, } = evalCtx;
      return Promise.resolve({
        ...appState,
        session: {
          ...appState.session,
          remainingWaitHours: correctAnswer.remainingWaitHours,
        },
      });
    }

    if (appState.postEvalState === SessionState.START_NEW_SESSION) {
      // update note queue
      // update queueIndex
      // update globalIndex

      const { evalCtx, } = appState;
      const { cutoffDate, } = evalCtx.correctAnswer;
      return advanceToNextConcept(appState, cutoffDate);
    }

    if (
      appState.postEvalState === SessionState.WAIT_NEXT_IN_QUEUE ||
      appState.postEvalState === SessionState.START_QUEUE
    ) {
      const { queueIndex, noteQueue, } = appState.session;
      let nextSessionState = appState.postEvalState;
      let nextQueueIndex = queueIndex;

      // let transitionFromBranchToMain = false;
      let transitionBackToParentDepth = false;
      let transitionNewToOld = false;

      if (noteQueue && queueIndex != null) {
        // only advance queue if waiting for next in queue
        // (e.g. shouldn't advance note if we are just START_QUEUE)
        if (appState.postEvalState === SessionState.WAIT_NEXT_IN_QUEUE) {
          nextQueueIndex = queueIndex + 1;
        }
        if (nextQueueIndex < noteQueue.length) {
          const curNote = noteQueue[queueIndex];
          const nextNote = noteQueue[nextQueueIndex];
          const curBranchDepth = curNote.branchDepth || 0;
          const nextBranchDepth = nextNote.branchDepth || 0;
          // const curAddFromBranch = noteQueue[queueIndex].addedFromBranch;
          // const nextAddFromBranch = noteQueue[nextQueueIndex].addedFromBranch;
          // if (curAddFromBranch && !nextAddFromBranch) {
          //   transitionFromBranchToMain = true;
          // }
          // check for depth transition
          if (curBranchDepth > nextBranchDepth) {
            transitionBackToParentDepth = true;
          }
          // check for queueStatus transition
          if (curNote.queueStatus === QueueStatus.NEW && nextNote.queueStatus === QueueStatus.OLD) {
            transitionNewToOld = true;
          }
          nextSessionState = getEntryStateForNoteType(nextNote.type);
        } else {
          const { startSessionTime, } = appState.session;
          // if user has already waited minimum amount of hours, dont allow
          // session to end. Just continue on with next concept. This is needed
          // to account for times when user leaves in middle of a session
          // and doesn't come back until days after. In this case we want user
          // to be able to finish current concept and then keep going, without
          // us prematurely ending their day after just a few notes just because
          // they have reached the end of current concept.

          const { success: sessionWaitTimeReached, } = hasWaitedMinHours(startSessionTime);

          if (startSessionTime && sessionWaitTimeReached) {
            return advanceToNextConcept(appState, new Date());
          }

          nextSessionState = SessionState.DONE_QUEUE;
        }
      }

      const markedTransition = transitionBackToParentDepth || transitionNewToOld;
      // if we detected a transition, need to grab ckey of new parent concept
      let extraFetch = Promise.resolve(null);
      if (markedTransition) {
        const nextNote = noteQueue[nextQueueIndex];
        extraFetch = CategoryAssistant.getCategoryById(nextNote.directParent);
      }

      return extraFetch.then(parentInfo => ({
        ...appState,
        transition: {
          depth: {
            backToParentDepth: transitionBackToParentDepth,
          },
          queueStatus: {
            newToOld: transitionNewToOld,
          },
          parentDescription: parentInfo ? parentInfo.ckey : null,
        },
        session: {
          ...appState.session,
          queueIndex: nextQueueIndex,
          state: nextSessionState,
          lastCompleted: nextSessionState === SessionState.DONE_QUEUE
            ? new Date()
            : appState.session.lastCompleted,
        },
      }));
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
