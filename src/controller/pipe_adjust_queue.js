import { isFailResponse, EvalStatus } from '~/core/eval';
import { SessionState, getCurrentNote } from '~/core/session_state';
import CategoryAssistant from '~/db/category_assistant';
import { log } from '~/logger';

const adjustableStates = [
  SessionState.RECALL_RESPONSE,
  SessionState.INPUT,
  SessionState.MULT_CHOICE,
  SessionState.SHOW_PATHS
];

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

  if (appState.evalCtx.status === EvalStatus.INVALID) {
    log('Invalid evaluation, skipping adjust queue.');
    return appState;
  }

  const session = appState.session;

  if (!adjustableStates.includes(session.state)) {
    return appState;
  }

  // adjust session with additional notes from path
  if (session.state === SessionState.SHOW_PATHS) {
    if (!isFailResponse(appState.evalCtx.answerQuality)) {
      const path = appState.evalCtx.correctAnswer;
      // if path == null, user did not choose any paths
      // and probably just wanted to advance current queue
      if (path != null) {
        return CategoryAssistant.getAllChildNotes(path.catId).then(notes => {
          const queue = session.noteQueue;
          const adjustedNoteQueue = [
            ...queue.slice(0, session.queueIndex + 1),
            ...notes,
            ...queue.slice(session.queueIndex + 1, queue.length)
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
    }
    return appState;
  }

  const answerQuality = appState.evalCtx.answerQuality;
  if (isFailResponse(answerQuality)) {
    const noteQueue = session.noteQueue;
    // if note queue is already max queue length, do nothing;
    // if (noteQueue.length >= MAX_NOTES_IN_QUEUE) {
    //   return appState;
    // }
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
