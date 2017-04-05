import { getEntryStateForNoteType } from '~/core/session_state';
import CategoryAssistant from '~/db/category_assistant';

export default function pipe(appState) {
  if (
    !{}.hasOwnProperty.call(appState, 'session') ||
    !{}.hasOwnProperty.call(appState, 'manualQueueIds')
  ) {
    return appState;
  }

  const idList = appState.manualQueueIds;
  if (idList == null || idList.length === 0) {
    return appState;
  }

  const session = appState.session;

  return CategoryAssistant.getNotesByIds(idList).then(notes => {
    if (notes != null && notes.length) {
      const adjustedNoteQueue = notes;
      const adjustedSession = {
        ...session,
        noteQueue: adjustedNoteQueue,
        state: getEntryStateForNoteType(notes[0].type),
        queueIndex: 0,
        globalIndex: 0,
        baseQueueLength: 1,
      };
      return {
        ...appState,
        session: adjustedSession,
      };
    }
    return appState;
  });
}
