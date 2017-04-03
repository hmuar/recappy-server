import { isFailResponse } from '~/core/eval';
import { SessionState, getCurrentNote } from '~/core/session_state';
import { MAX_NOTES_IN_QUEUE } from '~/core/scheduler';
import CategoryAssistant from '~/db/category_assistant';

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export default function pipe(appState) {
  if (!{}.hasOwnProperty.call(appState, 'session')) {
    return appState;
  }

  if (!appState.evalCtx || appState.evalCtx == null) {
    return appState;
  }

  const session = appState.session;

  // adjust session with additional notes from path
  if (session.state === SessionState.SHOW_PATHS) {
    if (!isFailResponse(appState.evalCtx.answerQuality)) {
      const path = appState.evalCtx.correctAnswer;
      return CategoryAssistant.getAllChildNotes(path.catId).then(notes => {
        const queue = session.noteQueue;
        const adjustedNoteQueue = [
          ...queue.slice(0, session.queueIndex + 1),
          ...notes,
          ...queue.slice(session.queueIndex + 1, queue.length),
        ];
        const adjustedSession = {
          ...session,
          noteQueue: adjustedNoteQueue,
          baseQueueLength: session.baseQueueLength + notes.length,
        };
        return {
          ...appState,
          session: adjustedSession,
        };
      });
    }
    return appState;
  }

  const answerQuality = appState.evalCtx.answerQuality;
  if (isFailResponse(answerQuality)) {
    const noteQueue = session.noteQueue;
    // if note queue is already max queue length, do nothing;
    if (noteQueue.length >= MAX_NOTES_IN_QUEUE) {
      return appState;
    }
    const adjustedNoteQueue = [...noteQueue];
    const minIndex = session.queueIndex < session.baseQueueLength
      ? session.baseQueueLength
      : session.queueIndex;
    const adjustNoteIndex = getRandomInt(minIndex, noteQueue.length);

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
