import updateModelForUser from '~/student';
import { getCurrentNote } from '~/core/session_state';
// import CatLabel from '~/core/category';
import { log, logErr } from '~/logger';

export default function pipe(appState) {
  if (!appState || !appState.session) {
    logErr('No appState or session found trying to pipe student model');
    return Promise.resolve(appState);
  }
  const curNote = getCurrentNote(appState.session);
  if (!curNote) {
    // log('No current note found when trying to pipe student model');
    return Promise.resolve(appState);
  }
  return updateModelForUser(appState.userID, curNote, appState.evalCtx).then(() => appState);
}
