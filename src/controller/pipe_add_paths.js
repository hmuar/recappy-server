import { SessionState, getCurrentNote } from '~/core/session_state';
import { NoteRecord } from '~/db/collection';
import _ from 'lodash';

export default function pipe(appState) {
  // get current note
  const note = getCurrentNote(appState.session);
  if (!note.paths) {
    return Promise.resolve(appState);
  }
  return NoteRecord.findOne({ userID: appState.userID,
                             noteID: note._id })
  .then(record => {
    if (appState.session.state !== SessionState.SHOW_PATHS) {
      return {
        paths: [],
        ...appState,
      };
    }
    const pathsWithIndex = note.paths.map((path, index) => (
      {
        ...path,
        index,
      }
    ));
    const recPaths = record.pathHistory ? record.pathHistory : [];
    return {
      paths: _.differenceWith(pathsWithIndex, recPaths, (np, rp) => (
        np.catId === rp.toHexString()
      )),
      ...appState,
    };
  });
  // add paths from current note that are not in noteRecord paths
}
