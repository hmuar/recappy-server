import SimulatorController from '~/admin/simulator/controller';
import { SessionState } from '~/core/session_state';
import { ObjectID } from '~/db/collection';
import pipeSaveSimSession from '~/admin/simulator/pipe_save_sim_session';

const HARDCODED_SUBJECT_ID = ObjectID('f64c57184a4ef7f0357f9cd6');
const DEBUG = true;

export const SIM_TYPE = {
  Days: 'DAYS',
  Steps: 'STEPS',
};

class Simulator {
  constructor() {
    this.controller = new SimulatorController();
    this.stepIndex = 0;
    this.daysCompleted = 0;
  }

  // success: bool indicating correct response
  generateMsg(userID, successBaseProb, initSession = null) {
    return {
      timestamp: new Date().getTime(),
      senderID: userID,
      subjectID: HARDCODED_SUBJECT_ID,
      simulatorInput: {
        successBaseProb,
      },
      session: initSession,
    };
  }

  runSimByType(user, count, simType) {
    if (simType === SIM_TYPE.Days) {
      return this.runDays(user, count);
    } else if (simType === SIM_TYPE.Steps) {
      return this.runSteps(user, count);
    }
    console.log('Sim type not recognized');
    return Promise.resolve();
  }

  runSim(user, count, simType) {
    return this.runSimByType(user, count, simType).then(state => pipeSaveSimSession(state));
  }

  runSteps(user, numSteps) {
    const debug = DEBUG;
    const evalStepFunc = state => {
      if (state.session) {
        return this.runSingleStep(user, state.session, debug);
      }
      return this.runSingleStep(user, null, debug);
    };

    let chain = Promise.resolve({});
    for (let i = 0; i < numSteps; i++) {
      chain = chain.then(state => {
        console.log(`--------------- Running sim step [${this.stepIndex}]-----------------`);
        return evalStepFunc(state);
      });
    }
    return chain;
  }

  startDays(user, numDays) {
    return this.runDays(user, numDays);
  }

  runDays(user, numDays, initState = null) {
    if (this.daysCompleted < numDays) {
      const initSession = initState ? initState.session : null;
      return this.runSingleStep(user, initSession).then(state =>
        this.runDays(user, numDays, state));
    }
    return Promise.resolve(initState);
  }

  // complete
  runSingleStep(user, initSession = null, debug = false) {
    const { id, successBaseProb, } = user;
    // const success = Math.random() < successProb;
    const msg = this.generateMsg(id, successBaseProb, initSession);
    const finalState = this.controller.registerMsg(msg, debug).then(state => {
      if (state.session.state === SessionState.DONE_QUEUE) {
        this.daysCompleted += 1;
        console.log(`----- [ Day ${this.daysCompleted} ] -------`);
      }
      return state;
    });
    this.stepIndex += 1;
    return finalState;
  }
}

export default Simulator;
