import { logErr } from '~/logger';
import pipeAddSession from '~/controller/pipe_add_session';
import pipeAddSimulatorSession from '~/admin/simulator/pipe_add_sim_session';
import pipeRecord from '~/controller/pipe_record';
import pipeSimEval from '~/admin/simulator/pipe_sim_eval';
import pipeAdvanceSimState from '~/admin/simulator/pipe_advance_sim_state';
import pipeSaveSimSession from '~/admin/simulator/pipe_save_sim_session';
import pipeStudentModel from '~/controller/pipe_student_model';
import pipeAdjustQueue from '~/controller/pipe_adjust_queue';
// import pipeAddPaths from '~/controller/pipe_add_paths';
import pipeRecordSimStats from '~/admin/simulator/pipe_record_sim_stats';
import pipeSimNoteRecords from '~/admin/simulator/pipe_sim_note_records';

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
  registerMsg(msg) {
    // convert adapter specific sender id into app user
    const appState = msg;
    return (
      this.pipeUser(appState)
        // at this point should have app user information
        .then(state => {
          // if session was passed in from previous sim step, use it
          if (state.session != null) {
            return state;
          }
          return pipeAddSession(state);
        })
        .then(state => pipeAddSimulatorSession(state))
        // at this point should have session information
        // need to evaluate msg in context of current state
        .then(state => pipeSimEval(state))
        // .then(state => this.sendFeedbackResponse(state))
        // adjust queue based on evaluation
        .then(state => pipeAdjustQueue(state))
        // advance session state
        .then(state => pipeAdvanceSimState(state))
        // .then(state => {
        //   return pipeAddPaths(state);
        // })
        // record new session state
        .then(state => pipeRecordSimStats(state))
        // persist results of msg evaluation
        .then(state => pipeRecord(state))
        .then(state => pipeSimNoteRecords(state))
        .then(state => pipeSaveSimSession(state))
        // .then(state => logState(state))
        .then(state => {
          // don't include this in return chain because this final update
          // can happen asynchronously
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
