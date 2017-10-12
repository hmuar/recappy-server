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

const NEXT_PROMPT = [
  'K, onto the next story!',
  'Next story --',
  "Ok here's another story for ya.",
  'Got another story for you.',
  'I found another story!'
];

export function nextPrompt() {
  return `${randomChoice(NEXT_PROMPT)}`;
}

const ORIGINAL_TOPIC_PHRASES = ["K let's get back to", 'Alright back to'];

export function backToOriginalTopic(topic) {
  return `${randomChoice(ORIGINAL_TOPIC_PHRASES)} ${topic}.`;
}

const REVIEW_PHRASES = [
  "Let's do a little review of past topics, starting with",
  "Review time of past topics! Let's start with"
];

export function reviewTime(topic) {
  return `${randomChoice(REVIEW_PHRASES)} ${topic}.`;
}

const NO_NEW_BUT_REVIEW = [
  "No more new stuff yet, but let's look at some past info that is on our scheduled review for today. First,",
  "No new stories, but let's do a quick quiz review of previous topics that we might be starting to forget. First,"
];

export function noNewButReview(topic) {
  return `${randomChoice(NO_NEW_BUT_REVIEW)} ${topic}.`;
}

const NO_NEW = [
  "No new stuff yet, I'm still reading up on current events. I'll have more in a day or two ⏰. If you haven't disabled notifications, I'll message you as soon as I have another story!",
  "Nothing new quite yet, I'm still looking for good topics. I'll get ya something in a day or two ⏰"
];

export function noNew() {
  return randomChoice(NO_NEW);
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
  "Not quite. I think it's actually",
  "Actually I think it's",
  'The answer is actually',
  'I actually think the answer is',
  "Not exactly, it's"
];

export function wrongAnswer(correctAnswer) {
  return `${randomChoice(WRONG_ANSWER_PHRASE)} '${correctAnswer}'`;
}

const TRIGGER_FOLLOWUP_PHRASE = ['The actual answer is', 'So the answer is actually'];

export function triggerFollowup(correctAnswer) {
  return `${randomChoice(TRIGGER_FOLLOWUP_PHRASE)} ${correctAnswer}`;
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

// const SESSION_DONE_PHRASE = [
//   'no more to learn for today, all done! Great job! Check back in tomorrow 🙂',
//   "annd we're done! Nice work today! Yay let's learn more later tomorrow. See ya!",
//   "Good job today! whew we learned alot, let's take a break and learn more tomorrow.",
//   "wooo we got through everything for today! Great work! Time to take a break and let it sink in. Let's learn more later, k? Byeee 👋🏼",
//   'done done and done! Great job today. More learning later, see ya 🙃'
// ];

const SESSION_DONE_PHRASE = [
  'no more news for today, all done! Check back in a few days 🙂',
  "annd we're done! more stories in a few days. See ya!",
  "I'm all out of stuff for today, more in a few days. see ya 🙃"
];

export function doneSession() {
  return randomChoice(SESSION_DONE_PHRASE);
}

const CONTINUE_PHRASE = ['got it, keep going', "what's next?", 'got it', 'ok', 'alright'];

export function keepGoing() {
  return randomChoice(CONTINUE_PHRASE);
}

const SKIP_PHRASE = ['skip this', "i'm not interested", 'got other news?', 'boring...😴'];

export function skipThis() {
  return randomChoice(SKIP_PHRASE);
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

const THE_ANSWER_WAS = ['the best answer was', 'I was looking for'];

export function theAnswerWas() {
  return randomChoice(THE_ANSWER_WAS);
}
