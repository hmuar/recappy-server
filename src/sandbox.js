// import { checkInputAgainstAnswer } from '~/core/eval/textProcess';
import natural from 'natural';
// import nlp from 'compromise';
// import { getTypingDelay } from '~/adapter/fbmessenger/fbmessenger_request';

natural.PorterStemmer.attach();

// let a = 'positive + negativity';
// console.log(a.tokenizeAndStem());
//
// let b = 'vaelence??! ok whaterv, ?';
// console.log(b.tokenizeAndStem());
//
// let c = 'valence';
// let c2 = 'vaelencee';
// console.log(c.stem());
// console.log(c2.stem());
// console.log('HO'.stem().toLowerCase());
// console.log(natural.JaroWinklerDistance('+'.stem(), '+'.stem()));
// console.log(natural.JaroWinklerDistance('velenc', 'valenc'));
// console.log(natural.LevenshteinDistance('tyy', 'two'));
// console.log(natural.LevenshteinDistance('foru', 'four'));

// console.log(natural.Metaphone.compare('three', 'two'));

// let d = ['positivity', 'hallo'];
// console.log(d.map(e => e.tokenizeAndStem()));

// const isMatch = checkInputAnswerMatch('+, dog, cta', '- || vael || cat');
// console.log(`Match detected: ${isMatch}`);
// const isMatch = checkInputAgainstAnswer('velence', 'valence');
// console.log(`Match detected: ${isMatch}`);

// const typingDelayText = 'Carbon is a small and flexible atom. This makes it such a useful element that it shows up EVERYWHERE life is. No plants or animals would be around without carbon.';
// console.log(getTypingDelay(typingDelayText));

// const sentenceText = 'Carbon is a small and flexible atom 😀. This makes it such a useful element that it shows up EVERYWHERE life is 😙 No plants or animals would be around without carbon.';
const sentenceText = "People walk up and stand next to each other to talk!?!? They exchange words. Let's pretend those people are atoms in a molecule. If the people are the atoms, then the words they exchange are _____________.";
const sentenceTokenizer = new natural.SentenceTokenizer();
const tokens = sentenceTokenizer.tokenize(sentenceText);
// console.log(tokens);
// console.log(tokens.join(' '));

const MAX_MESSAGE_LENGTH = 100;

let messageLength = 0;
for (let i = 0; i < tokens.length; i++) {
  const token = tokens[i];
  messageLength += token.length;
  if (messageLength > MAX_MESSAGE_LENGTH) {
    console.log(i);
    console.log(sentenceText.slice(0, messageLength));
    console.log(sentenceText.slice(messageLength, sentenceText.length));
    break;
  }
}
