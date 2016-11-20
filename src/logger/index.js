const winston = require('winston');
// require('winston-loggly-bulk');

winston.level = 'info';

winston.add(
  winston.transports.File, {
    filename: 'logs/server.log',
    level: 'info',
    eol: '\n', // for Windows, or `eol: ‘n’,` for *NIX OSs
    json: false,
    prettyPrint: true,
    timestamp: true,
    colorize: false,
  }
);

// Loggly support
// winston.add(winston.transports.Loggly, {
//   token: 'a83fa8e7-216d-4f0b-ace4-bdeed10cdf39',
//   subdomain: 'sadbandit',
//   tags: ['Winston-NodeJS'],
//   json: true,
// });

export default winston;

export function log(msg) {
  // console.log(msg);
  winston.log('info', msg);
  return msg;
}

export function logErr(msg) {
  // console.log(msg);
  winston.log('error', msg);
  return msg;
}

export function logState(appState) {
  const { input,
          userID,
          senderID,
          session,
          evalCtx,
          preEvalState,
          postEvalState } = appState;
  const { queueIndex, state, globalIndex } = session;
  let noteType = 'None';
  const maxQueueIndex = session.noteQueue.length - 1;
  if (queueIndex <= maxQueueIndex) {
    noteType = session.noteQueue[queueIndex].type;
  }
  const tState = {
    sender: `${senderID}, user: ${userID}`,
    note: `${queueIndex}: (${queueIndex + 1}/${maxQueueIndex + 1}) ${noteType}`,
    input,
    evalCtx,
    state: `${preEvalState} --> ${postEvalState} --> ${state}`,
    globalIndex,
    queue: session.noteQueue.map((note) => ({
      group: note.group,
      type: note.type,
    })),
  };
  winston.log('info', tState);
  return appState;
}
