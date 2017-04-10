import SpacedRep from '~/core/spaced_repetition';
// import { log, logErr } from '~/logger';

const SandboxMsgTypes = {
  SPACED_REP: 'spaced-rep',
};

// expected msg format:
// {
//   responses: list of responseQuality values (0 - 5)
// }

function spaceRepHandler(msg) {
  const {
    startInterval = SpacedRep.defaultInterval,
    startFactor = SpacedRep.defaultFactor,
    startCount = SpacedRep.defaultCount,
    responses,
  } = msg;

  if (!responses || !responses.length) {
    return {};
  }

  let interval = startInterval;
  let factor = startFactor;
  let count = startCount;

  const history = [];

  for (const resp of responses) {
    factor = SpacedRep.calcFactor(factor, resp);
    interval = SpacedRep.calcInterval(interval, factor, count, resp);
    history.push({
      factor,
      interval,
      count,
    });
    count += 1;
  }

  return history;
}

function getMsgHandler(msgType) {
  switch (msgType) {
    case SandboxMsgTypes.SPACED_REP:
      return spaceRepHandler;
    default:
      return null;
  }
}

export default class SandboxController {
  registerMsg(msg) {
    const resp = getMsgHandler(msg.type)(msg);
    return Promise.resolve(resp);
  }
}
