import _ from 'lodash';
import natural from 'natural';
import nlp from 'compromise';

const JARO_WINKLER_THRESHOLD = 0.81;
// const LEVENSHTEIN_THRESHOLD = 2;

natural.PorterStemmer.attach();
const tokenizer = new natural.WordTokenizer();
const excessCharRegex = /[.\/#?!$%\^&\*;:{}=_`~()]/g;

function removeArticles(input) {
  return input.replace(/\bthe\b|\ban\b|\ba\b/g, '');
}

function preProcess(text) {
  return text.trim();
}

function cleanToken(token) {
  return token.toLowerCase().trim().replace(excessCharRegex, '');
}

function tokenizeInput(input) {
  return removeArticles(input).split(/\s*,\s*and\s+|\s+and\s+|\s*,\s*|\s+/).map(s => s.trim());
}

function addNumericalTokens(tokenText) {
  const numData = nlp(tokenText).values().data();
  if (numData && numData.length) {
    const tokens = [];
    numData.forEach(nd => {
      const { number, text, } = nd;
      tokens.push(number.toString());
      tokens.push(text);
    });
    return tokens;
  }
  return [];
}

function tokenizeAnswer(input) {
  const comp = input.split(/\s*,\s*and\s+|\s+and\s+|\s*,\s*/).map(s => s.trim());
  const length = comp.length;
  const tokens = comp.reduce(
    (acc, val) => {
      const orComponents = val.split('||').map(s => s.trim());
      // if components are numerical in nature, add both verbal and numerical
      // representation (e.g. '2' and 'two')
      const numericalTokens = _.flattenDeep(orComponents.map(c => addNumericalTokens(c)));
      return [...acc, ...orComponents, ...numericalTokens];
    },
    []
  );
  return { tokens, size: length, };
}

function createInputMatchSet(input) {
  return createMatchSet(tokenizeInput(input).map(t => cleanToken(t)));
}

function createAnswerMatchSet(answer) {
  const { tokens, size, } = tokenizeAnswer(answer);
  return createMatchSet(tokens.map(t => cleanToken(t)), size);
}

function createMatchSet(tokens, size = null) {
  const tokenSet = new Set(tokens);
  const uniqueTokens = [...tokenSet];
  const stems = uniqueTokens.map(t => t.stem());
  const elems = _.zip(uniqueTokens, stems);
  return {
    elems,
    size: size || elems.length,
  };
}

// matchElemA and matchElemB should be
// [ text, stem ]
function fuzzyEval(matchElemA, matchElemB) {
  const [textA, stemA] = matchElemA;
  const [textB, stemB] = matchElemB;
  if (textA !== textB) {
    // if small word, it is considered ok if the first letter matches
    // AND there is just a transposition at the end of the word
    if (stemB.length === 1) {
      return stemA === stemB;
    }
    if (stemB.length < 4) {
      if (stemA === stemB) {
        return true;
      }
      if (stemA[0] !== stemB[0]) {
        return false;
      }
      // check for transposition at the end of the 3 letter word
      // e.g. 'tow' vs 'two' is ok
      return stemA[1] === stemB[2] && stemA[2] === stemB[1];
    }
    // for larger words use JaroWinkler distance
    const dist = natural.JaroWinklerDistance(stemA, stemB);
    return dist > JARO_WINKLER_THRESHOLD;
  }
  return true;
}

function checkMatch(inputMatchSet, answerMatchSet) {
  if (inputMatchSet.size === 0 || answerMatchSet.size === 0) {
    return false;
  }
  if (inputMatchSet.size < answerMatchSet.size) return false;
  let matchCount = 0;
  for (const inputElem of inputMatchSet.elems) {
    // iterate through answer set to check for equivalence
    for (const answerElem of answerMatchSet.elems) {
      // iterate through each element after splitting it based on custom
      // OR delimiter we use to denote multiple answers, each ONE of which
      // by itself is enough for entire answer to be correct
      if (fuzzyEval(inputElem, answerElem)) {
        matchCount += 1;
        // if we've already reached needed matchCount, just break early and return
        if (matchCount >= answerMatchSet.size) {
          return true;
        }
        break;
      }
    }
  }
  return matchCount >= answerMatchSet.size;
}

// check for match between raw user input with structured note answer
export function checkInputAgainstAnswer(input, answer) {
  // step 1 - clean, tokenize, and stem
  const inputSet = createInputMatchSet(preProcess(input));
  const answerSet = createAnswerMatchSet(preProcess(answer));

  console.log(inputSet);
  console.log(answerSet);

  return checkMatch(inputSet, answerSet);
}
