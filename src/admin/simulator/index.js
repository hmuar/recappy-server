import SimulatorController from '~/admin/simulator/controller';
import { SessionState } from '~/core/session_state';
import { ObjectID } from '~/db/collection';

const HARDCODED_SUBJECT_ID = ObjectID('f64c57184a4ef7f0357f9cd6');

class Simulator {
  constructor() {
    this.controller = new SimulatorController();
    this.stepIndex = 0;
    this.daysCompleted = 0;
  }

  // success: bool indicating correct response
  generateMsg(userID, success, initSession = null) {
    return {
      timestamp: new Date().getTime(),
      senderID: userID,
      subjectID: HARDCODED_SUBJECT_ID,
      simulatorInput: {
        success,
      },
      session: initSession,
    };
  }

  startDays(user, numDays) {
    return this.runDays(user, numDays);
  }

  runSteps(user, numSteps) {
    const evalStepFunc = state => {
      if (state.session) {
        return this.runEval(user, state.session);
      }
      return this.runEval(user);
    };

    let chain = Promise.resolve({});
    for (let i = 0; i < numSteps; i++) {
      chain = chain.then(state => evalStepFunc(state));
    }
    return chain;
  }

  // debugBacklogCount() {
  //   const HARDCODED_SIM_USER_ID = ObjectID('58ec1b70509986fe34517f71');
  //   return getSessionForUserAndSubject(HARDCODED_SIM_USER_ID, HARDCODED_SUBJECT_ID)
  //     .then(session => ({
  //       session,
  //     }))
  //     .then(appState => {
  //       console.log('!!!!!!!');
  //       console.log(appState);
  //       return getBacklogCount(appState).then(count => console.log(`Backlog count: ${count}`));
  //     });
  // }

  runDays(user, numDays) {
    // return this.debugBacklogCount();

    if (this.daysCompleted < numDays) {
      return this.runEval(user).then(() => this.runDays(user, numDays));
    }
    return Promise.resolve({});
  }

  // complete
  runEval(user, initSession = null) {
    const { id, successProb, } = user;
    const success = Math.random() < successProb;
    console.log(`--------------- Running sim step [${this.stepIndex}]-----------------`);
    const msg = this.generateMsg(id, success, initSession);
    const finalState = this.controller.registerMsg(msg).then(state => {
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
