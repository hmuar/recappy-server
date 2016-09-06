import SpacedRep from '../core/spaced_repetition';
import { SessionState } from '../core/session_state';
import { NoteRecord } from '../db/collection';

// Record results of input evaluation using NoteRecord collection
// This will involve calculating future due date, updating note history

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
  const avg = sum / (lastResponses.length);
  return avg;
}

// calculate new factor
// calculate new interval
function pipeSpaceRepVals(recordCtx,
                          record,
                          evalCtx) {
  const rec = record || {
    factor: SpacedRep.defaultFactor,
    interval: SpacedRep.defaultInterval,
    count: SpacedRep.defaultCount,
  };

  const responseQuality = evalCtx.answerQuality;
  const newFactor = SpacedRep.calcFactor(rec.factor, responseQuality);
  const newCount = rec.count + 1;

  const newInterval = SpacedRep.calcInterval(rec.interval,
                                           newFactor,
                                           newCount,
                                           responseQuality);
  return {
    ...recordCtx,
    factor: newFactor,
    interval: newInterval,
    count: newCount,
  };
}

function pipeDates(recordCtx) {
  const due = SpacedRep.calcDueDate(recordCtx.interval);
  return {
    ...recordCtx,
    due,
    lastDone: new Date(),
  };
}

function pipeHistory(recordCtx, record, evalCtx) {
  if (!record) {
    const history = [evalCtx.answerQuality];
    return {
      ...recordCtx,
      history,
    };
  }
  const history = record.history;
  history.push(evalCtx.answerQuality);
  return {
    ...recordCtx,
    history,
  };
}

// recordCtx needs to have history
function pipeHealth(recordCtx) {
  return {
    ...recordCtx,
    health: calcNoteHealth(recordCtx.history),
  };
}

function createNewRecord(userID, note, recordCtx) {
  // let noteRecordSchema = new mongoose.Schema({
  //   userID : mongoose.Schema.Types.ObjectId,
  //   noteID : mongoose.Schema.Types.ObjectId,
  //   noteType : String,
  //   count : Number,
  //   factor : Number,
  //   interval : Number,
  //   subjectParent : mongoose.Schema.Types.ObjectId,
  //   lastDone : Date,
  //   due : Date,
  //   history : [Number],
  //   health : Number
  // });

  const recData = {
    userID,
    noteID: note._id,
    noteType: note.type,
    subjectParent: note.parent[0],
  };
  const newRecord = {
    ...recordCtx,
    ...recData,
  };
  return NoteRecord.create(newRecord);
}

export default function pipe(mState) {
  // inspect evalCtx
  // grab current note info from `session.noteQueue[session.queueIndex]`
  // update NoteRecord using note info and evalCtx data

  if (!{}.hasOwnProperty.call(mState, 'evalCtx')) {
    return mState;
  }

  const session = mState.session;

  if (session.state === SessionState.DONE_QUEUE) {
    return mState;
  }

  const note = session.noteQueue[session.queueIndex];
  const evalCtx = mState.evalCtx;

  return NoteRecord.findOne({ userID: mState.userID,
                             noteID: note._id })
  .then(record => {
    let recordCtx = {};
    recordCtx = pipeSpaceRepVals(recordCtx,
                                 record,
                                 evalCtx);


    // record = createNewRecord(mState.userID,
    //                          note,
    //                          recUpdate);

    recordCtx = pipeDates(recordCtx);
    recordCtx = pipeHistory(recordCtx, record, evalCtx);
    recordCtx = pipeHealth(recordCtx, record, evalCtx);

    if (record) {
      return record.update(recordCtx).then(() => (
        {
          ...mState,
          recordCtx,
        }
      ));
    }
    // need to create new record
    return createNewRecord(mState.userID,
                           note,
                           recordCtx).then(() => (
                             {
                               ...mState,
                               recordCtx,
                             }
                           ));
  });
}
