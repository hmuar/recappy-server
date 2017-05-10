import { checkInputAgainstAnswer } from '~/core/eval/textProcess';
import natural from 'natural';
import nlp from 'compromise';
import { getTypingDelay } from '~/adapter/fbmessenger/fbmessenger_request';

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

const typingDelayText = 'Carbon is a small and flexible atom. This makes it such a useful element that it shows up EVERYWHERE life is. No plants or animals would be around without carbon.';
console.log(getTypingDelay(typingDelayText));
