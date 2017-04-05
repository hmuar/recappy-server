import DBAssist from '~/db/category_assistant';
import { log, logErr } from '~/logger';
import pipeAddSession from '~/controller/pipe_add_session';
import pipeSaveSession from '~/controller/pipe_save_session';
import pipeSetQueue from '~/admin/pipeSetQueue';
import AdminAdapter from '~/adapter/admin';

export default class AdminController {
  constructor() {
    this.adapter = AdminAdapter;
  }

  // convert adapter specific sender id into app user id
  pipeUser(appState) {
    return this.adapter.senderToUser(appState).then(newState => {
      // create a new user if user could not be found
      if (!newState.userID) {
        logErr('Could not find user');
      }
      return newState;
    });
  }

  debugDBAssist(msg) {
    DBAssist.getCategoryByName('subject', msg.subjectName)
      .then(subject => {
        log(subject);
      })
      .catch(err => {
        logErr('error finding category by name');
        logErr(err);
      });
  }

  formResponse(state, response) {
    console.log('--- Controller send response ----');
    return {
      ...state,
      response,
    };
  }

  setNoteQueueWithIds(msg) {
    console.log('setNoteQueueWithIds');
    const idList = msg.manualQueueIds;
    const subjectName = msg.subjectName;

    if (idList != null) {
      return DBAssist.getCategoryByName('subject', subjectName).then(subject => {
        if (!subject) {
          throw new Error(`Could not find subject ${subjectName}`);
        } else {
          const appState = {
            ...msg,
            subjectID: subject._id,
          };
          // convert adapter specific sender id into app user
          return this.pipeUser(appState)
            .then(state => pipeAddSession(state))
            .then(state => pipeSetQueue(state))
            .then(state => pipeSaveSession(state))
            .then(state => this.formResponse(state, 'ok coo'));
        }
      });
    }
    return Promise.resolve(this.formResponse({}, 'No session state found'));
  }

  registerMsg(msg) {
    console.log(msg);
    console.log(msg.manualQueueIds);
    console.log('__________');
    if (msg.manualQueueIds) {
      return this.setNoteQueueWithIds(msg);
    }
    return Promise.resolve({});
  }

  // main entry method called by external adapters
  // registerMsg(msg) {
  //   return DBAssist.getCategoryByName('subject', msg.subjectName)
  //     .then(subject => {
  //       if (!subject) {
  //         throw new Error(`Could not find subject ${msg.subjectName}`);
  //       } else {
  //         const appState = {
  //           ...msg,
  //           subjectID: subject._id,
  //         };
  //         // convert adapter specific sender id into app user
  //         return (
  //           this.pipeUser(appState)
  //             // at this point should have app user information
  //             .then(state => pipeAddSession(state))
  //             // at this point should have session information
  //             // need to evaluate msg in context of current state
  //             // adjust queue based on evaluation
  //             .then(state => pipeAdjustQueue(state))
  //             // advance session state
  //             .then(state => pipeAdvanceState(state))
  //             .then(state => pipeAddPaths(state))
  //             .then(state => logState(state))
  //             // record new session state
  //             .then(state => pipeSaveSession(state))
  //             // .then(state => logState(state))
  //             .then(state => {
  //               // don't include this in return chain because this final udpate
  //               // can happen asynchronously
  //               pipeStudentModel(state);
  //               return this.sendResponse(state);
  //             })
  //         );
  //       }
  //     })
  //     .catch(err => {
  //       logErr('error registering message in controller');
  //       logErr(err);
  //     });
  // }
}
