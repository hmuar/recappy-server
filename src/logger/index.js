const winston = require('winston');
require('winston-loggly-bulk');

winston.level = 'info';

const logFileOptions = {
  name: 'file',
  filename: 'logs/server.log',
  level: 'info',
  eol: '\n', // for Windows, or `eol: ‘n’,` for *NIX OSs
  json: false,
  prettyPrint: true,
  // prettyPrint: object => JSON.stringify(object),
  timestamp: true,
  colorize: false,
};

winston.loggers.add('fileOnly', {
  file: logFileOptions,
  console: {
    level: 'error',
    colorize: true,
  },
});

winston.add(winston.transports.File, logFileOptions);

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
  const fileLogger = winston.loggers.get('fileOnly');
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
    userID: userID.toString(),
    note: `queueIndex: (${queueIndex}/${maxQueueIndex}), noteType: ${noteType}`,
    input,
    evalCtx,
    paths,
    state: `${preEvalState} --> ${postEvalState} --> ${state}`,
    globalIndex,
    queue: session.noteQueue.map((note, i) => ({
      i,
      display: note.displayRaw.slice(0, 10),
      type: note.type,
    })),
  };
  fileLogger.log('info', '-------------------------------------------------');
  fileLogger.log('info', tState);
  return appState;
}
