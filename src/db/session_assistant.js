import { SessionState } from '~/core/session_state';
import { StudentSession } from '~/db/collection';

// Return a session if user exists and they have a session already for
// `subjectID` subject.
// --------------------------------
// TODO: need to handle case where user exists, but subject does not better.
// Right now we are hitting the db more than we need to.

// return Promise
export function getSessionForUserAndSubject(userID, subjectID) {
  // Do sync code checking params and throwing errors inside Promise
  // so that errors are properly caught
  if (userID && subjectID) {
    return StudentSession.findOne({ userID, }).then(session => {
      if (session) {
        const subjects = session.subjects;
        const subjectIDString = subjectID.valueOf();
        if (subjects && subjectIDString in subjects) {
          return subjects[subjectIDString];
        }
        // TODO: should return entire session here
        //       so that we can use it to update subjects later,
        //       instead of having to query for session again.
        return null;
      }
      return null;
    });
  }
  return Promise.resolve(null);
}

// return Promise
export function updateSessionForUser(
  userID,
  subjectID,
  queueIndex,
  noteQueue,
  state,
  globalIndex,
  nextGlobalIndex,
  baseQueueLength,
  lastCompleted,
  newStartSessionTime = null
) {
  return StudentSession.findOne({ userID, }).then(session => {
    const subjectIDString = subjectID.valueOf();
    const subjects = session.subjects;

    const subject = subjects[subjectIDString];
    const { startSessionTime, createdAt, } = subject;

    const curDate = new Date();

    subjects[subjectIDString] = {
      queueIndex,
      noteQueue,
      state,
      globalIndex,
      nextGlobalIndex,
      baseQueueLength,
      createdAt,
      updatedAt: curDate,
      lastCompleted: lastCompleted || null,
      startSessionTime: newStartSessionTime || (startSessionTime || new Date()),
    };

    return StudentSession.findByIdAndUpdate(session._id, {
      $set: { subjects, updatedAt: curDate, },
    });
  });
}

export function createSession(
  userID,
  subjectID,
  queueIndex,
  noteQueue,
  globalIndex,
  nextGlobalIndex,
  baseQueueLength
) {
  return StudentSession.findOne({ userID, }).then(session => {
    const subjectIDString = subjectID.valueOf();

    let subjects = {};
    if (!session) {
      const curDate = new Date();
      subjects = {
        [subjectIDString]: {
          queueIndex: 0,
          noteQueue,
          state: SessionState.INTRO,
          globalIndex,
          nextGlobalIndex,
          baseQueueLength,
          lastCompleted: null,
          startSessionTime: new Date(),
          createdAt: curDate,
          updatedAt: curDate,
        },
      };
      const newSession = {
        userID,
        subjects,
        createdAt: curDate,
        updatedAt: curDate,
      };
      return StudentSession.create(newSession).then(() => subjects[subjectIDString]);
    }
    // session already exists, so need to return subject if exists,
    // and if not add to subjects array
    subjects = session.subjects;
    if (subjectIDString in subjects) {
      return subjects[subjectIDString];
    }
    subjects[subjectIDString] = {
      queueIndex: 0,
      noteQueue,
      state: SessionState.INIT,
      globalIndex,
      nextGlobalIndex,
      baseQueueLength,
      lastCompleted: null,
      startSessionTime: new Date(),
    };
    return StudentSession.findByIdAndUpdate(session._id, {
      $set: { subjects, },
    }).then(() => subjects[subjectIDString]);
  });
}
