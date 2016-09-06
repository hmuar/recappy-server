const minQuality = 0;
const maxQuality = 5;

const Answer = {
  min: minQuality,
  max: maxQuality,
  // a way of answering as confirmation,
  // effectively considered max quality
  ok: maxQuality,
  no: minQuality,
};

export default Answer;
