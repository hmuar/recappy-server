'use strict';
const Collection = require('../db/collection');
const StudentSession = Collection.StudentSession;
let StudySession = {};

// Return a session if user exists and they have a session already for
// `subjectID` subject.
// --------------------------------
// TODO: need to handle case where user exists, but subject does not better.
// Right now we are hitting the db more than we need to.
StudySession.getSessionForUserAndSubject = function(userID, subjectID) {
  return StudentSession.findOne({userID: userID}).then((session) => {
    if(session) {
      var subjects = session['subjects'];
      var subjectIDString = subjectID.valueOf();
      if(subjects && subjectIDString in subjects) {
        return subjects[subjectIDString];
      }
      else {
        // TODO: should return entire session here
        //       so that we can use it to update subjects later,
        //       instead of having to query for session again.
        return null;
      }
    }
    else {
      return null;
    }
  });
}

// return Promise
StudySession.updateSessionForUser = function(userID,
                                             subjectID,
                                             noteID,
                                             queueIndex,
                                             noteQueue,
                                             state,
                                             conceptGlobalIndex) {
  return StudentSession.findOne({userID: userID}).then((session) => {
    let subjectIDString = subjectID.valueOf();
    let subjects = session['subjects'];

    subjects[subjectIDString] = {
      noteID: noteID,
      queueIndex: queueIndex,
      noteQueue: noteQueue,
      state: state,
      globalIndex: conceptGlobalIndex
    }

    return StudentSession.findByIdAndUpdate(session._id, {
      $set: {subjects: subjects}
    });

  });

}

StudySession.createSession = function(userID,
                                      subjectID,
                                      noteID,
                                      queueIndex,
                                      noteQueue,
                                      state,
                                      conceptGlobalIndex) {

  return StudentSession.findOne({userID: userID}).then((session) => {
    var subjectIDString = subjectID.valueOf();
    if(!session) {
      var subjects = {};
      subjects[subjectIDString] = {
        noteID: noteID,
        queueIndex: 0,
        noteQueue: noteQueue,
        state: state,
        globalIndex: conceptGlobalIndex
      }
      var newSession = {
        userID: userID,
        subjects: subjects
      }
      return StudentSession.create(newSession).then(() => {
        return subjects[subjectIDString];
      });
    }
    else {
      subjects = session.subjects;
      if(subjectIDString in subjects) {
        return subjects[subjectIDString];
      }
      else {
        subjects[subjectIDString] = {
          noteID: noteID,
          queueIndex: 0,
          noteQueue: noteQueue,
          state: state,
          globalIndex: conceptGlobalIndex
        }
        return StudentSession.findByIdAndUpdate(session._id, {
          $set: {subjects: subjects}
        }).then(() => {
          return subjects[subjectIDString];
        });
      }
    }


  });

}

module.exports = StudySession;
