import Immut from 'immutable';
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
// recordCtx should be ImmutMap
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
  return recordCtx.merge({
    factor: newFactor,
    interval: newInterval,
    count: newCount,
  });
}

// recordCtx is Immut.Map
function pipeDates(recordCtx) {
  const due = SpacedRep.calcDueDate(recordCtx.get('interval'));
  return recordCtx.merge({
    due,
    lastDone: new Date(),
  });
}

// recordCtx is Immut.Map
function pipeHistory(recordCtx, record, evalCtx) {
  if (!record) {
    const history = [evalCtx.answerQuality];
    return recordCtx.set('history', history);
  }
  const history = record.get('history');
  history.push(evalCtx.answerQuality);
  return recordCtx.set('history', history);
}

// recordCtx needs to have history
// recordCtx is Immut.Map
function pipeHealth(recordCtx) {
  return recordCtx.set('health', calcNoteHealth(recordCtx.get('history')));
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
  // newRecord is combined Immut.Map
  const newRecord = recordCtx.merge(recData);
  return NoteRecord.create(newRecord.toObject());
}

function pipe(mState) {
  // inspect evalCtx
  // grab current note info from `session.noteQueue[session.queueIndex]`
  // update NoteRecord using note info and evalCtx data

  if (!mState.has('evalCtx')) {
    return mState;
  }

  const session = mState.get('session');

  if (session.state === SessionState.DONE_SESSION) {
    return mState;
  }

  const note = session.noteQueue[session.queueIndex];
  const evalCtx = mState.get('evalCtx');

  return NoteRecord.findOne({ userID: mState.get('userID'),
                             noteID: note._id })
  .then(record => {
    let recordCtx = Immut.Map({});

    recordCtx = pipeSpaceRepVals(recordCtx,
                                 record,
                                 evalCtx);


    // record = createNewRecord(mState.get('userID'),
    //                          note,
    //                          recUpdate);

    recordCtx = pipeDates(recordCtx);
    recordCtx = pipeHistory(recordCtx, record, evalCtx);
    recordCtx = pipeHealth(recordCtx, record, evalCtx);

    if (record) {
      return record.update(recordCtx.toObject()).then(() => (
        mState.set('recordCtx', recordCtx.toObject())
      ));
    }
    // need to create new record
    console.log('creating new record');
    return createNewRecord(mState.get('userID'),
                           note,
                           recordCtx).then(() => (
                             mState.set('recordCtx', recordCtx.toObject())
                           ));
  });
}

const PipeRecord = {
  pipe,
};

export default PipeRecord;
