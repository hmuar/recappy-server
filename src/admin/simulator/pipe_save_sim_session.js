import { StudentSession } from '~/db/collection';

export function updateSessionForUser(
  userID,
  subjectID,
  queueIndex,
  noteQueue,
  state,
  globalIndex,
  nextGlobalIndex,
  baseQueueLength,
  simulator
) {
  return StudentSession.findOne({ userID, }).then(session => {
    const subjectIDString = subjectID.valueOf();
    const subjects = session.subjects;

    subjects[subjectIDString] = {
      queueIndex,
      noteQueue,
      state,
      globalIndex,
      nextGlobalIndex,
      baseQueueLength,
      simulator: {
        ...simulator,
        step: simulator.step + 1,
      },
    };

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
    nextGlobalIndex,
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
    nextGlobalIndex,
    baseQueueLength,
    simulator
  ).then(() => appState);
}
