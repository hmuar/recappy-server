const DBAssist = require('../db/db_assistant');
const StudySession = require('../study/session');
const PipeSession = require('./pipe_session');
const Immut = require('immutable');

let Controller = function(adapter) {
  this.adapter = adapter;
}

// `msg` = {
//   timestamp  : ""
//   senderID   : "",
//   userID     : ObjectID,
//   text       : "",
//   action     : ""
// }

// check if key property added to msg and
// corresponding value is not undefined and not null
// `msg` is Immut.Map
Controller.prototype.pipeSuccess = function(msg, key) {
  return msg.has(key) && msg.get(key) != null ;
}

Controller.prototype.pipeUser = function(msg) {
  return this.adapter.senderToUser(msg);
}

// main entry method called by external adapters
// `msg` is Immut.Map
Controller.prototype.registerMsg = function(msg) {
  return DBAssist.getCategoryByName('subject', msg.get('subjectName'))
  .then(subject => {
    if(!subject) {
      throw new Error("Could not find subject " + msg.get('subjectName'));
    }
    else {
      msg = msg.set('subjectID', subject._id);
      return this.pipeUser(msg)
      .then(msg => PipeSession.pipe(msg))
      .then(msg => {
        return msg;
      })
    }
  });
}

module.exports = Controller;
