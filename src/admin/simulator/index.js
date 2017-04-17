import SimulatorController from '~/admin/simulator/controller';
import { Simulation } from '~/db/collection';
import { SessionState } from '~/core/session_state';
import { ObjectID } from '~/db/collection';
import pipeSaveSimSession from '~/admin/simulator/pipe_save_sim_session';

const HARDCODED_SUBJECT_ID = ObjectID('f64c57184a4ef7f0357f9cd6');
const DEBUG = false;

export const SIM_TYPE = {
  SkipDays: 'SKIP_DAYS',
  Days: 'DAYS',
  Steps: 'STEPS',
};

class Simulator {
  constructor() {
    this.controller = new SimulatorController();
    this.stepIndex = 0;

    this.dayIndex = 0;
    this.activeDaysCompleted = 0;

    this.skipDays = 0;
    this.currentActiveDayIndex = 0;
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

  generateSkipMsg(userID, initSession = null) {
    return {
      timestamp: new Date().getTime(),
      senderID: userID,
      subjectID: HARDCODED_SUBJECT_ID,
      session: initSession,
    };
  }

  // Core sim step execution
  _step(user, initSession = null, debug = false) {
    const { id, successBaseProb, } = user;
    // const success = Math.random() < successProb;
    const msg = this.generateMsg(id, successBaseProb, initSession);
    const finalState = this.controller.registerMsg(msg, debug).then(state => {
      if (state.session.state === SessionState.DONE_QUEUE) {
        this.registerDayCompleted(true);
        console.log(`----- [ Day ${this.activeDaysCompleted} ] -------`);
      }
      return state;
    });
    this.stepIndex += 1;
    return finalState;
  }

  runSteps(user, numSteps) {
    const debug = DEBUG;
    const evalStepFunc = state => {
      if (state.session) {
        return this._step(user, state.session, debug);
      }
      return this._step(user, null, debug);
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

  runDays(user, numDays, initState = null) {
    if (this.activeDaysCompleted < numDays) {
      // determine if user should be active today based on dailyActiveProb
      // if no use today, skip day
      const { dailyActiveProb, } = user;
      if (
        // don't check for skip possibility if this is already an active day
        this.dayIndex !== this.currentActiveDayIndex &&
        dailyActiveProb != null &&
        // random determination for whether to skip day
        Math.random() > dailyActiveProb
      ) {
        return this.runSkipDays(user, 1, initState).then(state =>
          this.runDays(user, numDays, state));
      }
      // this is an active day
      this.currentActiveDayIndex = this.dayIndex;
      const initSession = initState ? initState.session : null;
      return this._step(user, initSession).then(state => this.runDays(user, numDays, state));
    }
    return Promise.resolve(initState);
  }

  runSkipDays(user, numDays, initState = null) {
    this.skipDaysCompleted = 0;
    return this._executeSkipDays(user, numDays, initState).then(state => {
      this.skipDaysCompleted = 0;
      return state;
    });
  }

  _executeSkipDays(user, numDays, initState = null) {
    if (this.skipDaysCompleted < numDays) {
      const { id, } = user;
      const initSession = initState ? initState.session : null;
      const msg = this.generateSkipMsg(id, initSession);

      return this.controller
        .registerSkipMsg(msg)
        .then(state => {
          console.log('----- [ [SKIP] Day ] -------');
          this.registerDayCompleted(false);
          this.stepIndex += 1;
          return state;
        })
        .then(state => this._executeSkipDays(user, numDays, state));
    }
    return initState;
  }

  runSimByType(user, count, simType) {
    if (simType === SIM_TYPE.Days) {
      return this.runDays(user, count);
    } else if (simType === SIM_TYPE.SkipDays) {
      return this.runSkipDays(user, count);
    } else if (simType === SIM_TYPE.Steps) {
      return this.runSteps(user, count);
    }
    console.log('Sim type not recognized');
    return Promise.resolve();
  }

  runSim(user, count, simType) {
    return (
      this.runSimByType(user, count, simType)
        // save all aggregated sim records to db
        .then(state => {
          const simRecordsMap = state.session.simRecords;
          if (simRecordsMap) {
            const simRecords = Object.values(state.session.simRecords);
            if (simRecords && simRecords.length) {
              return Simulation.create(simRecords).then(() => state);
            }
          }
          return state;
        })
        .then(state => pipeSaveSimSession(state))
    );
  }

  registerDayCompleted(active) {
    this.dayIndex += 1;
    if (active) {
      this.activeDaysCompleted += 1;
    } else {
      this.skipDaysCompleted += 1;
    }
  }
}

export default Simulator;
