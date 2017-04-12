import SimulatorController from '~/admin/simulator/controller';
import { SessionState } from '~/core/session_state';
import { ObjectID } from '~/db/collection';

const DEBUG_PERF = true;
if (!DEBUG_PERF) {
  console.time = () => {};
  console.timeEnd = () => {};
}

const HARDCODED_SUBJECT_ID = ObjectID('f64c57184a4ef7f0357f9cd6');

class Simulator {
  constructor() {
    this.controller = new SimulatorController();
    this.stepIndex = 0;
    this.daysCompleted = 0;
  }

  // createNewUser() {
  //   return;
  // }

  // setUsers(users) {
  //   return;
  // }

  // `msg` = {
  //   timestamp  : ""
  //   senderID   : "",
  //   text       : "",
  //   action     : ""
  // }

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
    console.time('One Day --');
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

  runDays(user, numDays) {
    if (this.daysCompleted < numDays) {
      return this.runEval(user).then(() => this.runDays(user, numDays));
    }
    return Promise.resolve({});
  }

  // complete
  runEval(user, initSession = null) {
    const { id, successProb, } = user;
    const success = Math.random() < successProb;
    // console.log(`--------------- Running sim step [${this.stepIndex}]-----------------`);
    const msg = this.generateMsg(id, success, initSession);
    console.time('One Eval Step');
    const finalState = this.controller.registerMsg(msg).then(state => {
      console.timeEnd('controller');
      if (state.session.state === SessionState.DONE_QUEUE) {
        this.daysCompleted += 1;
        console.log(`----- [ Day ${this.daysCompleted} ] -------`);
        console.timeEnd('One Day --');
        console.time('One Day --');
      }
      console.timeEnd('One Eval Step');
      return state;
    });
    this.stepIndex += 1;
    return finalState;
  }
}

export default Simulator;
