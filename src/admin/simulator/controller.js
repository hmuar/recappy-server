import { logErr } from '~/logger';
import pipeAddSession from '~/controller/pipe_add_session';
import pipeAddSimulatorSession from '~/admin/simulator/pipe_add_sim_session';
import pipeRecord from '~/controller/pipe_record';
import pipeSimEval from '~/admin/simulator/pipe_sim_eval';
import pipeAdvanceSimState from '~/admin/simulator/pipe_advance_sim_state';
import pipeSaveSimSession from '~/admin/simulator/pipe_save_sim_session';
import pipeUpdateLocalSimSession from '~/admin/simulator/pipe_update_local_sim_session';
import pipeStudentModel from '~/controller/pipe_student_model';
import pipeAdjustQueue from '~/controller/pipe_adjust_queue';
// import pipeAddPaths from '~/controller/pipe_add_paths';
import pipeRecordSimStats from '~/admin/simulator/pipe_record_sim_stats';
import pipeSimNoteRecords from '~/admin/simulator/pipe_sim_note_records';

export default class SimulatorController {
  // for simulator, senderID should just be same as userID
  constructor() {
    this.debug = false;
  }

  pipeUser(appState) {
    return Promise.resolve({
      ...appState,
      userID: appState.senderID,
    });
  }

  pipeTimer(state, name = '', nameEnd = '', lvl = 0) {
    if (this.debug) {
      const finalName = '--'.repeat(lvl) + name;
      const finalNameEnd = '--'.repeat(lvl) + nameEnd;
      if (finalName) {
        console.time(finalName);
      }
      if (finalNameEnd) {
        console.timeEnd(finalNameEnd);
      }
    }
    return state;
  }

  sendResponse(state) {
    return state;
  }

  // msg should have additional simulator params
  registerMsg(msg, debug = false) {
    this.debug = debug;
    // convert adapter specific sender id into app user
    const appState = msg;
    this.pipeTimer({}, 'controller', '', 3);
    return (
      this.pipeUser(appState)
        // at this point should have app user information
        .then(state => this.pipeTimer(state, 'pipeAddSession'))
        .then(state => {
          // if session was passed in from previous sim step, use it
          if (state.session != null) {
            return state;
          }
          return pipeAddSession(state);
        })
        .then(state => this.pipeTimer(state, 'pipeAddSimulatorSession', 'pipeAddSession'))
        .then(state => pipeAddSimulatorSession(state))
        // at this point should have session information
        // need to evaluate msg in context of current state
        .then(state => this.pipeTimer(state, '', 'pipeAddSimulatorSession'))
        .then(state => pipeSimEval(state))
        // .then(state => this.sendFeedbackResponse(state))
        // adjust queue based on evaluation
        .then(state => pipeAdjustQueue(state))
        // advance session state
        .then(state => pipeAdvanceSimState(state))
        .then(state => this.pipeTimer(state, 'pipeRecordSimStats'))
        // .then(state => {
        //   return pipeAddPaths(state);
        // })
        // record new session state
        .then(state => pipeRecordSimStats(state))
        .then(state => this.pipeTimer(state, 'pipeRecord', 'pipeRecordSimStats'))
        // persist results of msg evaluation
        .then(state => pipeRecord(state))
        .then(state => this.pipeTimer(state, 'pipeSimNoteRecords', 'pipeRecord'))
        .then(state => pipeSimNoteRecords(state))
        .then(state => this.pipeTimer(state, 'pipeSaveSimSession', 'pipeSimNoteRecords'))
        .then(state => pipeSaveSimSession(state))
        // .then(state => pipeUpdateLocalSimSession(state))
        .then(state => this.pipeTimer(state, '', 'pipeSaveSimSession'))
        .then(state => {
          this.pipeTimer({}, '', 'controller', 3);
          // don't include this in return chain because this final update
          // can happen asynchronously
          // pipeStudentModel(state);
          return this.sendResponse(state);
        })
        .catch(err => {
          logErr('error registering message in controller');
          logErr(err);
        })
    );
  }
}
