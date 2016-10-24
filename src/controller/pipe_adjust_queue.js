import { isFailResponse } from '~/core/eval';
import { getCurrentNote } from '~/core/session_state';
import { MAX_NOTES_IN_QUEUE } from '~/core/scheduler';

function getRandomInt(min, max) {
  console.log(`+++++++++++++++++ Finding random int in (${min}, ${max})`);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export default function pipe(appState) {
  if (!{}.hasOwnProperty.call(appState, 'session')) {
    return appState;
  }

  if (!appState.evalCtx || appState.evalCtx == null) {
    return appState;
  }

  const answerQuality = appState.evalCtx.answerQuality;
  if (isFailResponse(answerQuality)) {
    const session = appState.session;
    const noteQueue = session.noteQueue;
    // if note queue is already max queue length, do nothing;
    if (noteQueue.length >= MAX_NOTES_IN_QUEUE) {
      return appState;
    }
    const adjustedNoteQueue = [...noteQueue];
    const minIndex = session.queueIndex < session.baseQueueLength ?
                      session.baseQueueLength : session.queueIndex;
    const adjustNoteIndex =
      getRandomInt(minIndex, noteQueue.length);

    console.log(`------------ Using random index ${adjustNoteIndex}`);

    adjustedNoteQueue.splice(adjustNoteIndex, 0, getCurrentNote(session));
    const adjustedSession = {
      ...session,
      noteQueue: adjustedNoteQueue,
    };
    return {
      ...appState,
      session: adjustedSession,
    };
  }

  return appState;
}
