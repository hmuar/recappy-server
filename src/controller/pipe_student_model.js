import Answer from '~/core/answer';
import updateCategoryForUser from '~/student';
import calcWeightDelta from '~/core/knowledge';
import { getCurrentNote } from '~/core/session_state';
import CatLabel from '~/core/category';
import { logErr } from '~/logger';

// TODO: replace hardcoded responseQuality
function getWeightDelta(note) {
  const { weight, level } = note;
  const responseQuality = Answer.max;
  return calcWeightDelta(weight, level, responseQuality);
}

// catData {catID, ctype, weightDelta}
export default function pipe(appState) {
  if (!appState || !appState.session) {
    logErr('No appState or session found trying to pipe student model');
    return Promise.resolve(appState);
  }
  const curNote = getCurrentNote(appState.session);
  if (!curNote) {
    logErr('No current note found when trying to pipe student model');
    return Promise.resolve(appState);
  }
  const weightDelta = getWeightDelta(curNote);
  const catData = {
    catID: curNote._id,
    ctype: CatLabel.Note,
    weightDelta,
  };
  return updateCategoryForUser(appState.userID, catData);
}
