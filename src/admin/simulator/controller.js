import DBAssist from '~/db/category_assistant';
import { log, logErr, logState } from '~/logger';
import pipeAddSession from '~/controller/pipe_add_session';
import pipeAddSimulatorSession from '~/admin/simulator/pipe_add_sim_session';
import pipeRecord from '~/controller/pipe_record';
import pipeSimEval from '~/admin/simulator/pipe_sim_eval';
import pipeAdvanceSimState from '~/admin/simulator/pipe_advance_sim_state';
import pipeSaveSimSession from '~/admin/simulator/pipe_save_sim_session';
import pipeStudentModel from '~/controller/pipe_student_model';
import pipeAdjustQueue from '~/controller/pipe_adjust_queue';
import pipeAddPaths from '~/controller/pipe_add_paths';
import pipeRecordSimStats from '~/admin/simulator/pipe_record_sim_stats';

// `msg` = {
//   timestamp  : ""
//   senderID   : "",
//   text       : "",
//   action     : ""
// }

export default class SimulatorController {
  // for simulator, senderID should just be same as userID
  pipeUser(appState) {
    return Promise.resolve({
      ...appState,
      userID: appState.senderID,
    });
  }

  sendResponse(state) {
    return state;
  }

  // msg should have additional simulator params
  registerMsg(msg, initSession = null) {
    // convert adapter specific sender id into app user
    console.time('controller');
    const appState = msg;
    console.time('Pipe user');
    return (
      this.pipeUser(appState)
        // at this point should have app user information
        .then(state => {
          console.timeEnd('Pipe user');
          console.time('Pipe add session');
          if (state.session != null) {
            return state;
          }
          return pipeAddSession(state);
        })
        .then(state => {
          console.timeEnd('Pipe add session');
          console.time('Pipe add simulator session');
          return pipeAddSimulatorSession(state);
        })
        // at this point should have session information
        // need to evaluate msg in context of current state
        .then(state => {
          console.timeEnd('Pipe add simulator session');
          console.time('Pipe sim eval');
          return pipeSimEval(state);
        })
        // .then(state => this.sendFeedbackResponse(state))
        // persist results of msg evaluation
        .then(state => {
          console.timeEnd('Pipe sim eval');
          console.time('Pipe record');
          pipeRecord(state);
          return state;
        })
        // adjust queue based on evaluation
        .then(state => {
          console.timeEnd('Pipe record');
          console.time('Pipe adjust queue');
          return pipeAdjustQueue(state);
        })
        // advance session state
        .then(state => {
          console.timeEnd('Pipe adjust queue');
          console.time('Pipe advance sim state');
          return pipeAdvanceSimState(state);
        })
        // .then(state => {
        //   console.timeEnd('Pipe advance sim state');
        //   console.time('Pipe add paths');
        //   return pipeAddPaths(state);
        // })
        // record new session state
        .then(state => {
          // console.timeEnd('Pipe add paths');
          console.timeEnd('--- advanceState');
          console.timeEnd('Pipe advance sim state');
          console.time('Pipe save sim session');
          pipeSaveSimSession(state);
          return state;
        })
        .then(state => {
          // console.timeEnd('---- update student session');
          console.timeEnd('Pipe save sim session');
          console.time('Pipe record sim stats');
          pipeRecordSimStats(state);
          return state;
        })
        // .then(state => logState(state))
        .then(state => {
          // don't include this in return chain because this final update
          // can happen asynchronously
          console.timeEnd('Pipe record sim stats');
          pipeStudentModel(state);
          return this.sendResponse(state);
        })
        .catch(err => {
          logErr('error registering message in controller');
          logErr(err);
        })
    );
  }
}
