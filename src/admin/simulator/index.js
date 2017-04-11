import SimulatorController from '~/admin/simulator/controller';

class Simulator {
  constructor() {
    this.controller = new SimulatorController();
    this.stepIndex = 0;
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
  generateMsg(userID, success) {
    return {
      timestamp: new Date().getTime(),
      senderID: userID,
      subjectName: 'biology',
      simulator: {
        success,
      },
    };
  }

  run(user, numSteps) {
    // return this.runEval(userID);
    // return [0, 1, 2, 3].reduce(
    //   promise => promise.then(() => this.runEval(userID)),
    //   Promise.resolve()
    // );
    const evalStepFunc = () => this.runEval(user);

    let chain = Promise.resolve();
    for (let i = 0; i < numSteps; i++) {
      chain = chain.then(evalStepFunc);
    }
    return chain;
  }

  // complete
  runEval(user) {
    const { id, successProb, } = user;

    const success = Math.random() < successProb;
    if (!success) {
      console.log(
        `--------------- Running sim step [${this.stepIndex}] success (${success})-----------------`
      );
    }
    const msg = this.generateMsg(id, success);
    const result = this.controller.registerMsg(msg);
    this.stepIndex += 1;
    return result;
  }
}

export default Simulator;
