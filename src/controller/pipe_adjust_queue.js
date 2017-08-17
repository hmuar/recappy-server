import { isFailResponse, EvalStatus } from '~/core/eval';
import { SessionState, getCurrentNote, QueueStatus } from '~/core/session_state';
import Input from '~/core/input';
import CategoryAssistant from '~/db/category_assistant';
import { log } from '~/logger';
import { isPromptNote } from '~/core/note';

const adjustableStates = [
  SessionState.INFO,
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

  const { input, } = appState;
  // adjust session with additional notes from path
  if (input && input.type === Input.Type.PATH) {
    if (!isFailResponse(appState.evalCtx.answerQuality)) {
      const path = appState.evalCtx.correctAnswer;
      // if path == null, user did not choose any paths
      // and probably just wanted to advance current queue
      if (path != null) {
        return CategoryAssistant.getAllChildNotes(path.catId, true).then(notes => {
          const curNote = getCurrentNote(session);
          const isPrompt = isPromptNote(curNote);

          if (notes && notes.length) {
            const queue = session.noteQueue;
            // if this is a prompt note, we want to clear out rest of queue
            // else, just add back the rest of the queue after slicing
            // the new path notes into the middle
            let remainingNotes = queue.slice(session.queueIndex + 1, queue.length);
            let newBaseQueueLength = 0;
            if (isPrompt) {
              const newRemainingNotes = remainingNotes.filter(
                n => n.queueStatus !== QueueStatus.NEW
              );
              const numNotesRemoved = remainingNotes.length - newRemainingNotes.length;
              remainingNotes = newRemainingNotes;
              newBaseQueueLength = session.baseQueueLength - numNotesRemoved + notes.length;
            } else {
              newBaseQueueLength = session.baseQueueLength + notes.length;
            }
            /*
            originSubjectParent is needed to track the subject
            parent of the original note. This is because paths can be added
            with notes from entirely different subjects. We need to know
            what the original subject is so that note records can properly
            refer to this, and so the proper old review notes can be queried
            if user is studying original subject, as opposed to whatever subject
            these path notes came from.
            */
            const originSubjectParent = curNote.originSubjectParent
              ? curNote.originSubjectParent
              : curNote.subjectParent;
            const adjustedNoteQueue = [
              ...queue.slice(0, session.queueIndex + 1),
              ...notes.map(n => ({
                ...n,
                // addedFromBranch: path.catId,
                branchDepth: (curNote.branchDepth || 0) + 1,
                originSubjectParent,
                queueStatus: QueueStatus.NEW,
              })),
              ...remainingNotes
            ];

            const adjustedSession = {
              ...session,
              noteQueue: adjustedNoteQueue,
              baseQueueLength: newBaseQueueLength,
            };
            return {
              ...appState,
              session: adjustedSession,
            };
          }
          return appState;
        });
      }
    }
    return appState;
  }

  // adjust session with additional notes from path
  // if (session.state === SessionState.SHOW_PATHS) {
  //   if (!isFailResponse(appState.evalCtx.answerQuality)) {
  //     const path = appState.evalCtx.correctAnswer;
  //     // if path == null, user did not choose any paths
  //     // and probably just wanted to advance current queue
  //     if (path != null) {
  //       return CategoryAssistant.getAllChildNotes(path.catId).then(notes => {
  //         const queue = session.noteQueue;
  //         const adjustedNoteQueue = [
  //           ...queue.slice(0, session.queueIndex + 1),
  //           ...notes,
  //           ...queue.slice(session.queueIndex + 1, queue.length)
  //         ];
  //         const adjustedSession = {
  //           ...session,
  //           noteQueue: adjustedNoteQueue,
  //           baseQueueLength: session.baseQueueLength + notes.length,
  //         };
  //         return {
  //           ...appState,
  //           session: adjustedSession,
  //         };
  //       });
  //     }
  //   }
  //   return appState;
  // }

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
