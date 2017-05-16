function randomChoice(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function generateQuestion(note) {
  if (note.phrase && note.phrase.pre && note.phrase.pre.length > 0) {
    const phrase = note.phrase.pre[Math.floor(Math.random() * note.phrase.pre.length)];
    return capitalizeFirstLetter(`${phrase} ${note.displayRaw}`);
  }
  return capitalizeFirstLetter(note.displayRaw);
}

const ORIGINAL_TOPIC_PHRASES = ["K let's get back to", 'Alright back to'];

export function backToOriginalTopic(topic) {
  return `${randomChoice(ORIGINAL_TOPIC_PHRASES)} ${topic}.`;
}

const POS_ENCOURAGE_PHRASES = [
  'great job!',
  'nice!',
  'awesome!',
  'yay, you are learning fast 🙂. Nice work!',
  'great! 👍🏼',
  'yes!',
  'nice work!',
  'yep, good job!'
];

export function positiveEncourage() {
  return randomChoice(POS_ENCOURAGE_PHRASES);
}

const NEG_ENCOURAGE_PHRASES = [
  "that's ok",
  'no worries!',
  "we'll come back to it, no worries!",
  "that's alright"
];

export function negativeEncourage() {
  return randomChoice(NEG_ENCOURAGE_PHRASES);
}

const WRONG_ANSWER_PHRASE = [
  "not quite. I think it's actually",
  "actually I think it's",
  'the answer is actually',
  'i actually think the answer is',
  "not exactly, it's"
];

export function wrongAnswer(correctAnswer) {
  return `${randomChoice(WRONG_ANSWER_PHRASE)} ${correctAnswer}`;
}

const WELCOME_BACK_PHRASE = [
  'welcome back!',
  "yay you're back!",
  'time for some more learnin.',
  'time to get our learn on again.',
  'all rested and ready to learn again, lets goooo!'
];

export function welcomeBack() {
  return randomChoice(WELCOME_BACK_PHRASE);
}

const SESSION_DONE_PHRASE = [
  'no more to learn for today, all done! Great job! Check back in tomorrow 🙂',
  "annd we're done! Nice work today! Yay let's learn more later tomorrow. See ya!",
  "Good job today! whew we learned alot, let's take a break and learn more tomorrow.",
  "wooo we got through everything for today! Great work! Time to take a break and let it sink in. Let's learn more later, k? Byeee 👋🏼",
  'done done and done! Great job today. More learning later, see ya later 🙃'
];

export function doneSession() {
  return randomChoice(SESSION_DONE_PHRASE);
}

const CONTINUE_PHRASE = [
  'got it, keep going',
  "what's next?",
  'keep going',
  'got it',
  'ok',
  'alright'
];

export function keepGoing() {
  return randomChoice(CONTINUE_PHRASE);
}

const GET_IT_RIGHT_QUESTION_PHRASE = [
  'did you get it right?',
  'is that what you were thinking?',
  'were you thinking that?',
  'were you thinking the same thing?',
  'is that what you thought too?'
];

export function isThatWhatYouThought() {
  return randomChoice(GET_IT_RIGHT_QUESTION_PHRASE);
}
