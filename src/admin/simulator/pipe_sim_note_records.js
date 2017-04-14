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
  const { userID, subjectID, simRecordID, } = appState;
  return getAllNoteRecords(userID, subjectID).then(recs => {
    const recsByNoteID = {};
    for (let i = 0; i < recs.length; i++) {
      const rec = recs[i];
      if (rec && rec.noteID) {
        recsByNoteID[rec.noteID.toString()] = rec;
      }
    }

    return Simulation.findByIdAndUpdate(simRecordID, {
      // $set: { noteRecords: recsByNoteID, },
      $set: {
        noteRecords: recs,
        noteRecordsMap: recsByNoteID,
      },
    }).then(() => recsByNoteID);
  });
}

export default function pipe(appState) {
  if (appState.simRecordID) {
    return updateSimRecord(appState).then(noteRecordsMap => ({
      ...appState,
      session: {
        ...appState.session,
        simulator: {
          ...appState.session.simulator,
          noteRecordsMap,
        },
      },
    }));
  }
  return appState;
}
