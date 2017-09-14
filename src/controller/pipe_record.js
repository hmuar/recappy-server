import SpacedRep from '~/core/spaced_repetition';
import { SessionState, getCurrentNote } from '~/core/session_state';
import { NoteRecord } from '~/db/collection';
import { EvalStatus } from '~/core/eval';
import { log } from '~/logger';

// Record results of input evaluation using NoteRecord collection
// This will involve calculating future due date, updating note history

const recordableStates = [
  SessionState.RECALL_RESPONSE,
  SessionState.INPUT,
  SessionState.MULT_CHOICE,
  // SessionState.INFO,
  SessionState.SHOW_PATHS
];

function calcNoteHealth(responseHistory) {
  if (responseHistory.length === 0) {
    return 0;
  }

  if (responseHistory.length > 3) {
    let allBad = true;
    for (let i = 0; i < 3; i++) {
      if (responseHistory[responseHistory.length - 1 - i] !== 0) {
        allBad = false;
        break;
      }
    }
    // if past x responses were all bad, drop note health to 0
    if (allBad) {
      return 0;
    }
  }

  const lastResponses = responseHistory.slice(-4);
  // var sum = 5;
  let sum = 0;
  for (let i = 0; i < lastResponses.length; i++) {
    sum += lastResponses[i];
  }

  // var avg = sum / (lastResponses.length + 1);
  const avg = sum / lastResponses.length;
  return avg;
}

// calculate new factor
// calculate new interval
function pipeSpaceRepVals(recordCtx, record, evalCtx) {
  const rec = record || {
    factor: SpacedRep.defaultFactor,
    interval: SpacedRep.defaultInterval,
    count: SpacedRep.defaultCount,
  };

  const responseQuality = evalCtx.answerQuality;
  const newFactor = SpacedRep.calcFactor(rec.factor, responseQuality);
  const newCount = rec.count + 1;

  const newInterval = SpacedRep.calcInterval(rec.interval, newFactor, newCount, responseQuality);
  const factorHistory = rec.factorHistory || [];
  const intervalHistory = rec.intervalHistory || [];

  return {
    ...recordCtx,
    factor: newFactor,
    interval: newInterval,
    count: newCount,
    factorHistory: [...factorHistory, newFactor],
    intervalHistory: [...intervalHistory, newInterval],
  };
}

function pipeDates(recordCtx, record) {
  const due = SpacedRep.calcDueDate(recordCtx.interval);
  const lastDoneDate = new Date();
  const dueHistory = record ? record.dueHistory || [] : [];
  const lastDoneHistory = record ? record.lastDoneHistory || [] : [];

  return {
    ...recordCtx,
    due,
    lastDone: lastDoneDate,
    dueHistory: [...dueHistory, due],
    lastDoneHistory: [...lastDoneHistory, lastDoneDate],
  };
}

function pipeResponseHistory(recordCtx, record, evalCtx) {
  if (!record) {
    const responseHistory = [evalCtx.answerQuality];
    return {
      ...recordCtx,
      responseHistory,
    };
  }
  const responseHistory = record.responseHistory;
  responseHistory.push(evalCtx.answerQuality);
  return {
    ...recordCtx,
    responseHistory,
  };
}

// recordCtx needs to have responseHistory
function pipeHealth(recordCtx) {
  return {
    ...recordCtx,
    health: calcNoteHealth(recordCtx.responseHistory),
  };
}

function pipePathHistory(recordCtx, record, evalCtx) {
  if (!recordCtx || !record || !evalCtx) {
    return recordCtx;
  }

  if (evalCtx.correctAnswer) {
    const catId = evalCtx.correctAnswer.catId;
    const pathHistory = record.pathHistory || [];
    return {
      ...recordCtx,
      pathHistory: [...pathHistory, catId],
    };
  }

  return recordCtx;
}

function pipeDateUpdate(recordCtx, record) {
  if (!recordCtx) {
    return recordCtx;
  }
  const curDate = new Date();
  return {
    ...recordCtx,
    createdAt: record && record.createdAt ? record.createdAt : curDate,
    updatedAt: curDate,
  };
}

function createNewRecord(userID, note, recordCtx, subjectParent) {
  const recData = {
    userID,
    noteID: note._id,
    noteType: note.type,
    subjectParent,
  };
  const newRecord = {
    ...recordCtx,
    ...recData,
  };
  return NoteRecord.create(newRecord);
}

export default function pipe(appState) {
  // inspect evalCtx
  // grab current note info from `session.noteQueue[session.queueIndex]`
  // update NoteRecord using note info and evalCtx data

  if (!{}.hasOwnProperty.call(appState, 'evalCtx')) {
    return appState;
  }

  if (appState.evalCtx.status === EvalStatus.INVALID) {
    log('Invalid evaluation, skipping record activity.');
    return appState;
  }

  const { session, } = appState;

  if (!recordableStates.includes(session.state)) {
    return appState;
  }

  const { queueIndex, baseQueueLength, noteQueue, } = session;
  if (!noteQueue || noteQueue.length === 0) {
    log('No notes in noteQueue, could not record activity.');
    return appState;
  }

  // if evaluating a note that has been re-added to end of queue
  // because of a previous failure eval, don't record any stats
  if (queueIndex > baseQueueLength - 1) {
    // log('Note is from extended queue, skipping note record');
    return appState;
  }

  const note = getCurrentNote(session);
  const evalCtx = appState.evalCtx;

  return NoteRecord.findOne({
    userID: appState.userID,
    noteID: note._id,
  }).then(record => {
    let recordCtx = {};
    if (session.state === SessionState.SHOW_PATHS) {
      recordCtx = pipePathHistory(recordCtx, record, evalCtx);
    } else {
      recordCtx = pipeSpaceRepVals(recordCtx, record, evalCtx);
      recordCtx = pipeDates(recordCtx, record);
      recordCtx = pipeResponseHistory(recordCtx, record, evalCtx);
      recordCtx = pipeHealth(recordCtx, record, evalCtx);
      recordCtx = pipeDateUpdate(recordCtx, record);
    }

    if (record) {
      return record.update(recordCtx).then(() => ({
        ...appState,
        recordCtx,
      }));
    }

    // originSubjectParent helps resolve differences if note was added from
    // a path from an entirely different subject than original subject
    const subjectParent = note.originSubjectParent ? note.originSubjectParent : note.subjectParent;
    // need to create new record
    return createNewRecord(appState.userID, note, recordCtx, subjectParent).then(() => ({
      ...appState,
      recordCtx,
    }));
  });
}
