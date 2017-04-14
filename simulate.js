#!/usr/bin/env node

import Database from '~/db/db';
import Simulator, { SIM_TYPE } from '~/admin/simulator';
import { ObjectID } from '~/db/collection';

const HARDCODED_SIM_USER_ID = ObjectID('58ec1b70509986fe34517f71');
const SUCCESS_BASE_PROB = 0.6;

function start() {
  console.time('Total sim time');
  const args = require('yargs').argv;

  const simulator = new Simulator();
  const userProfile = {
    id: HARDCODED_SIM_USER_ID,
    successBaseProb: SUCCESS_BASE_PROB,
  };

  if (args.days) {
    const numDays = args.days;
    return simulator.runSim(userProfile, numDays, SIM_TYPE.Days);
  }
  if (args.steps) {
    const numSteps = args.steps;
    return simulator.runSim(userProfile, numSteps, SIM_TYPE.Steps);
  }
  console.log('No acceptable flags submitted, no simulaton run');
  return null;
}

const db = new Database();
db
  .setup()
  .then(() => start())
  .then(() => {
    console.timeEnd('Total sim time');
    console.log('Done running simulation');
  })
  .then(() => process.exit(0));
