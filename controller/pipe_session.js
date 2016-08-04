const DBAssist = require('../db/db_assistant');
const StudySession = require('../study/session');

function addNewSession(msg) {
  return StudySession.createSession(msg.get('userID'),
                                    msg.get('subject'),
                                    null,
                                    0,
                                    [],
                                    '',
                                    0)
  .then(session => {
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
                          msg.get('subject'))
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
