#!/usr/bin/env node

import Database from '~/db/db';
import Simulator from '~/admin/simulator';
import { ObjectID } from '~/db/collection';

const HARDCODED_SIM_USER_ID = ObjectID('58ec1b70509986fe34517f71');
const SUCCESS_BASE_PROB = 0.6;

function start() {
  const args = require('yargs').argv;

  const simulator = new Simulator();
  const userProfile = {
    id: HARDCODED_SIM_USER_ID,
    successBaseProb: SUCCESS_BASE_PROB,
  };

  if (args.notes) {
    const numSteps = args.notes;
    console.log(`[Running for ${numSteps} steps]`);
    return simulator.runSteps(userProfile, numSteps);
  } else if (args.days) {
    const numDays = args.days;
    console.log(`[Running for ${numDays} days]`);
    return simulator.startDays(userProfile, numDays);
  }
  console.log('No acceptable flags submitted, no simulaton run');
}

const db = new Database();
db.setup().then(() => start()).then(() => console.log('Done running simulation'));
// .then(() => process.exit(0));
