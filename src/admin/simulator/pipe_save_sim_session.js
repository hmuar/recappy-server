import { StudentSession } from '~/db/collection';

export function updateSessionForUser(
  userID,
  subjectID,
  queueIndex,
  noteQueue,
  state,
  conceptGlobalIndex,
  baseQueueLength,
  simulator
) {
  console.time('---- find student session');
  return StudentSession.findOne({ userID, }).then(session => {
    console.timeEnd('---- find student session');
    const subjectIDString = subjectID.valueOf();
    const subjects = session.subjects;

    subjects[subjectIDString] = {
      queueIndex,
      noteQueue,
      state,
      globalIndex: conceptGlobalIndex,
      baseQueueLength,
      simulator,
    };
    // console.time('---- update student session');

    // return StudentSession.findByIdAndUpdate(session._id, {
    //   $set: { subjects, },
    // });
    return session.update({
      $set: { subjects, },
    });
  });
}

// Returns promise
export default function pipe(appState) {
  const { userID, subjectID, } = appState;
  const {
    queueIndex,
    noteQueue,
    state,
    globalIndex,
    baseQueueLength,
    simulator,
  } = appState.session;
  return updateSessionForUser(
    userID,
    subjectID,
    queueIndex,
    noteQueue,
    state,
    globalIndex,
    baseQueueLength,
    simulator
  ).then(() => appState);
}
