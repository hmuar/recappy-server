import Database from '~/db/db';
import Simulator from '~/admin/simulator';
import { ObjectID } from '~/db/collection';

const HARDCODED_SIM_USER_ID = ObjectID('58ec1b70509986fe34517f71');

function start() {
  const args = process.argv.slice(2);
  let numSteps = 10;
  if (args.length > 0) {
    numSteps = parseInt(args[0], 10);
  }

  const simulator = new Simulator();
  const userProfile = {
    id: HARDCODED_SIM_USER_ID,
    successProb: 1.0,
  };

  return simulator.run(userProfile, numSteps);
}

const db = new Database();
db
  .setup()
  .then(() => start())
  .then(() => console.log('Done running simulation'))
  .then(() => process.exit(0));
