const DBAssist = require('../db/db_assistant');
const StudySession = require('../study/session');
const Scheduler = require('../core/scheduler.js')

// StudyController.getNextNoteQueueInfo = function(subject, numNotes, userID, lastGlobalIndex) {
//   var nextNotes = Scheduler.getNextNotes(subject, NUM_SESSION_NOTES, userID, lastGlobalIndex);
//
//   var oldNotes = nextNotes[0];
//   var newNotes = nextNotes[1];
//
//   if(oldNotes.length == 0 && newNotes.length == 0) {
//     return [null, []];
//   }
//   else {
//     var noteIDs = []
//     var allNotes = oldNotes.concat(newNotes);
//     for(var i=0; i<allNotes.length; i++) {
//       noteIDs.push(allNotes[i]._id);
//     }
//     var hasNewNote = newNotes.length > 0
//
//     var info = {
//       firstNote: allNotes[0],
//       noteIDs: noteIDs,
//       hasNewNote: hasNewNote
//     }
//
//     return info;
//   }
// }

function addNewSession(msg) {

  // get new notes
  let subjectID = msg.get('subjectID');
  let userID = msg.get('userID');

  return Scheduler.getStartingNotes(subjectID,
                                    Scheduler.TARGET_NUM_NOTES_IN_SESSION)
  .then(noteQueue => {
    let startNoteIndex = 0;
    let startGlobalIndex = 0;
    return StudySession.createSession(userID,
                                      subjectID,
                                      noteQueue[0],
                                      startNoteIndex,
                                      noteQueue,
                                      startGlobalIndex)
  }).then(session => {
    return msg.set('session', session);
  })
}

// find existing user session for given subject and set `session` key
// to session object. If no session exists, create new session first.
// `msg` is Immut.Map
// return Immut.Map
function pipe(msg) {
  // if(!msg.get('text') && ! msg.get('action')) {
  //   return Promise.reject("No text or action included in message");
  // }
  return StudySession.getSessionForUserAndSubject(
                          msg.get('userID'),
                          msg.get('subjectID'))
  .then( session => {
    if(!session) {
      return addNewSession(msg);
    }
    else {
      return msg.set('session', session);
    }
  });
}

let PipeSession = {
  pipe: pipe
}

module.exports = PipeSession
