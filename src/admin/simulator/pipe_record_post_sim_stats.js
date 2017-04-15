/**

 Depends on a simRecordID field being set by pipe_record_sim_stats

**/

import { Simulation, NoteRecord } from '~/db/collection';

function getAllNoteRecords(userID, subjectID) {
  // dont query info notes
  return NoteRecord.find({
    userID,
    subjectParent: subjectID,
    noteType: { $ne: 'info', },
  });
}

function updateSimRecord(appState) {
  const { userID, subjectID, session, } = appState;
  return getAllNoteRecords(userID, subjectID).then(recs => {
    const recsByNoteID = {};
    const counts = [];
    const intervals = [];
    for (let i = 0; i < recs.length; i++) {
      const rec = recs[i];
      if (rec && rec.noteID) {
        counts.push(rec.count);
        intervals.push(rec.interval);
        recsByNoteID[rec.noteID.toString()] = rec.count;
      }
    }

    const { baseQueueLength, noteQueue, simulator, simRecords, } = session;

    const simStep = simulator.step;
    const simRec = simRecords[simStep];

    const newNotes = noteQueue.slice(0, baseQueueLength).filter(n => n.queueStatus === 'new');
    const oldNotesSeen = simulator.notesSeen ? simulator.notesSeen : 0;
    const notesSeen = oldNotesSeen + newNotes.length;

    simRec.notesSeen = notesSeen;
    simRec.noteGlobalIndexes = newNotes.map(note => note.globalIndex);
    simRec.noteRecords = {
      counts,
      intervals,
    };

    simulator.noteRecordsMap = recsByNoteID;
    simulator.notesSeen = notesSeen;

    return appState;

    // return Simulation.findByIdAndUpdate(simRecordID, {
    //   // $set: { noteRecords: recsByNoteID, },
    //   $set: {
    //     noteRecords: recs,
    //     noteRecordsMap: recsByNoteID,
    //   },
    // }).then(() => recsByNoteID);
  });
}

export default function pipe(appState) {
  const { session, } = appState;
  const simStep = session.simulator.step;

  if (session.simRecords && session.simRecords[simStep]) {
    return updateSimRecord(appState);
  }

  return appState;

  // return updateSimRecord(appState).then(noteRecordsMap => ({
  //   ...appState,
  //   session: {
  //     ...appState.session,
  //     simulator: {
  //       ...appState.session.simulator,
  //       noteRecordsMap,
  //     },
  //   },
  // }));
}
