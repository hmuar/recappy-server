import Eval from '~/core/eval';

const { minResponseQuality, maxResponseQuality } = Eval;

export default {
  min: minResponseQuality,
  max: maxResponseQuality,
  // a way of answering as confirmation,
  // effectively considered max quality
  ok: maxResponseQuality,
  no: minResponseQuality,
};
