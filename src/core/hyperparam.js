const isProduction = process.env.NODE_ENV === 'production';

const prodTargetNumNotesInSession = 15;
const devTargetNumNotesInSession = 2;

export const targetNumNotesInSession = isProduction
  ? prodTargetNumNotesInSession
  : devTargetNumNotesInSession;
export const maxNotesInQueue = targetNumNotesInSession * 5;
export const intervalToMinutesFactor = 1440; // 1440 min in one day
export const intervalToSecondsFactor = 86400; // 86400 secs in one day
export const maxIntervalDays = 365;
// amount of time in hours users must wait before beginning a new session
export const minSessionWaitHours = 7;

// Simulation params
export const simBaseProb = 0.6;

// Feedback params
export const gifSuccessProb = 0.2;
