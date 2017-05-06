const winston = require('winston');
require('winston-loggly-bulk');

winston.level = 'info';

winston.add(winston.transports.File, {
  name: 'file',
  filename: 'logs/server.log',
  level: 'info',
  eol: '\n', // for Windows, or `eol: ‘n’,` for *NIX OSs
  json: false,
  prettyPrint: true,
  // prettyPrint: object => JSON.stringify(object),
  timestamp: true,
  colorize: false,
});

// Loggly support
winston.add(winston.transports.Loggly, {
  token: 'a83fa8e7-216d-4f0b-ace4-bdeed10cdf39',
  subdomain: 'sadbandit',
  tags: ['Winston-NodeJS'],
  json: true,
});

export default winston;

export function log(msg) {
  return msg;
}

export function logErr(msg) {
  winston.log('error', msg);
  return msg;
}

export function logState(appState) {
  const {
    input,
    userID,
    senderID,
    session,
    evalCtx,
    paths,
    preEvalState,
    postEvalState,
  } = appState;
  const { queueIndex, state, globalIndex, } = session;
  let noteType = 'None';
  const maxQueueIndex = session.noteQueue.length - 1;
  if (queueIndex <= maxQueueIndex) {
    noteType = session.noteQueue[queueIndex].type;
  }
  const tState = {
    senderID,
    userID,
    note: `${queueIndex}: (${queueIndex + 1}/${maxQueueIndex + 1}) ${noteType}`,
    input,
    evalCtx,
    paths,
    state: `${preEvalState} --> ${postEvalState} --> ${state}`,
    globalIndex,
    queue: session.noteQueue.map(note => ({
      display: note.displayRaw.slice(0, 20),
      type: note.type,
    })),
  };
  winston.log('info', tState);
  return appState;
}
