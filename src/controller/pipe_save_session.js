import { updateSessionForUser } from '~/db/session_assistant';
import { minSessionWaitHours } from '~/core/hyperparam';

const MILLISECONDS_TO_HOURS = 1.0 / 3600000;

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
    lastCompleted,
    startSessionTime,
  } = appState.session;

  let newStartSessionTime = null;
  if (startSessionTime) {
    const curTime = new Date();
    const waitedTimeInHours = (curTime - startSessionTime) * MILLISECONDS_TO_HOURS;
    // if current time is long enough after previous startSessionTime,
    // treat this as the start of a new session, so update start session time
    console.log(`Checking waited time in hours ${waitedTimeInHours}...................`);
    console.log(`Comparing to minimum wait time: ${minSessionWaitHours}`);
    if (waitedTimeInHours >= minSessionWaitHours) {
      console.log(`Minimum wait time achieved!! Updating new sessionStartTime to ${curTime}`);
      newStartSessionTime = curTime;
    }
  }

  return updateSessionForUser(
    userID,
    subjectID,
    queueIndex,
    noteQueue,
    state,
    globalIndex,
    nextGlobalIndex,
    baseQueueLength,
    lastCompleted,
    newStartSessionTime
  ).then(() => appState);
}
