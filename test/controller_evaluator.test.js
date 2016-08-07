'use strict';

const test = require('blue-tape');
const before = test;
const after = test;
const TestDatabase = require('./test_database');
const db = new TestDatabase();
const Immut = require('immutable');
const Evaluator = require('../controller/evaluator');
const SessionState = require('../study/session_state').SessionState;
const Input = require('../core/input');
const Answer = require('../core/answer');

function getSession() {
  return {
    queueIndex: 0,
    noteQueue:
     [ { _id: db.createObjectID('9e16c772556579bd6fc6c222'),
         createdAt: '2016-08-06T00:33:36.808Z',
         ctype: 'note',
         order: 1,
         type: 'info',
         weight: 1,
         level: 1,
         display: '<p>Carbon has 6 protons and 6 neutrons in its nucleus. This makes it a relatively small, flexible atom so it is very useful. This helps make carbon fundamental to life. Without carbon all human, plant, and animal life would not be possible. We are all <strong>carbon-based</strong> lifeforms.</p>',
         extra: '',
         extra_media: '',
         ckey: 'proton-neutron-electron',
         displayRaw: 'Carbon has 6 protons and 6 neutrons in its nucleus. This makes it a relatively small, flexible atom so it is very useful. This helps make carbon fundamental to life. Without carbon all human, plant, and animal life would not be possible. We are all carbon-based lifeforms.',
         globalIndex: 0,
         directParent: db.createObjectID('7980227254feb46736ca47fd'),
         __v: 0,
         parent: [] },
       { _id: db.createObjectID('987e8177faf2c2f03c974482'),
         createdAt: '2016-08-06T00:33:36.808Z',
         ctype: 'note',
         order: 2,
         type: 'recall',
         weight: 0.5,
         level: 0.2,
         display: '<p>How many protons and neutrons does carbon have?</p>',
         extra: '',
         extra_media: '',
         ckey: 'q-protons-neutrons',
         displayRaw: 'How many protons and neutrons does carbon have?',
         globalIndex: 1,
         directParent: db.createObjectID('7980227254feb46736ca47fd'),
         __v: 0,
         parent: [] },
       {
         _id : db.createObjectID("ff7cbfb397fb2794827739ad"),
         "createdAt" : "2016-04-15T00:36:56.879Z",
         "ctype" : "note",
         "order" : 9,
         "type" : "choice",
         "weight" : 1,
         "level" : 0.8,
         "display" : "<p>A polar covalent bond leads to what?</p>",
         "extra" : "",
         "extra_media" : "",
         "parent" : [],
         "ckey" : "polar-covalent-bond",
         "displayRaw" : "A polar covalent bond leads to what?",
         "choice1" : "equal sharing of electrons",
         "choice2" : "sharing of electrons between molecules",
         "choice3" : "slightly charged sides of a molecule",
         "choice4" : "no sharing of charges",
         "choice5" : "sharing of neutrons between molecules",
         "answer" : 3,
         "hidden" : "Polar covalent bonds have unequal sharing of electrons, so some sides of molecules will be more negatively charged and some more positively charged.",
         "globalIndex" : 65,
         "subjectParent" : db.createObjectID("f64c57184a4ef7f0357f9cd6"),
         "directParent" : db.createObjectID("f9e515b670e5b8de9210872e"),
         "phrase" : {
             "pre" : []
         },
         "label" : "" },
      { "_id" : db.createObjectID("1abf784a870127cca006e09c"),
        "createdAt" : "2016-04-13T17:16:38.076Z",
        "ctype" : "note",
        "order" : 4,
        "type" : "input",
        "weight" : 0.5,
        "level" : 0.5,
        "display" : "<p>what the outermost filled electron shell is called?</p>",
        "extra" : "",
        "extra_media" : "",
        "parent" : [],
        "ckey" : "atomic-shell-valence",
        "displayRaw" : "what the outermost filled electron shell is called?",
        "answer" : "valence",
        "hidden" : "Remember that an atom likes to get together with other atoms just so it can share and exchange electrons with them and fill this valence shell.",
        "phrase" : {
            "pre" : [
                "Do you remember",
                "Can you tell me"
            ]
        },
        "globalIndex" : 26,
        "subjectParent" : db.createObjectID("f64c57184a4ef7f0357f9cd6"),
        "directParent" : db.createObjectID("f9e515b670e5b8de9210872e"),
        "label" : ""},
      { _id: db.createObjectID("57a533de11aa3f271d51a2ab"),
        directParent: db.createObjectID("7980227254feb46736ca47fd"),
        globalIndex: 2,
        displayRaw: 'How many protons and neutrons does carbon have?',
        ckey: 'test-default-3-recall',
        extra_media: '',
        extra: '',
        display: '<p>Default note 3 question?</p>',
        level: 0.2,
        weight: 0.5,
        type: 'recall',
        order: 2,
        ctype: 'note',
        createdAt: "2016-08-06T00:48:29.339Z",
        __v: 0,
        parent: [] },
      { _id: db.createObjectID("57a533de11aa3f271d51a2ac"),
        directParent: db.createObjectID("7980227254feb46736ca47fd"),
        globalIndex: 2,
        displayRaw: 'How many protons and neutrons does carbon have?',
        ckey: 'test-default-3-recall',
        extra_media: '',
        extra: '',
        display: '<p>Default note 3 question?</p>',
        level: 0.2,
        weight: 0.5,
        type: 'recall',
        order: 2,
        ctype: 'note',
        createdAt: "2016-08-06T00:48:29.339Z",
        __v: 0,
        parent: [] },
      { _id: db.createObjectID("57a533de11aa3f271d51a2ad"),
        directParent: db.createObjectID("7980227254feb46736ca47fd"),
        globalIndex: 2,
        displayRaw: 'How many protons and neutrons does carbon have?',
        ckey: 'test-default-3-recall',
        extra_media: '',
        extra: '',
        display: '<p>Default note 3 question?</p>',
        level: 0.2,
        weight: 0.5,
        type: 'recall',
        order: 2,
        ctype: 'note',
        createdAt: "2016-08-06T00:48:29.339Z",
        __v: 0,
        parent: [] },
      { _id: db.createObjectID("57a533de11aa3f271d51a2ae"),
        directParent: db.createObjectID("7980227254feb46736ca47fd"),
        globalIndex: 2,
        displayRaw: 'How many protons and neutrons does carbon have?',
        ckey: 'test-default-3-recall',
        extra_media: '',
        extra: '',
        display: '<p>Default note 3 question?</p>',
        level: 0.2,
        weight: 0.5,
        type: 'recall',
        order: 2,
        ctype: 'note',
        createdAt: "2016-08-06T00:48:29.339Z",
        __v: 0,
        parent: [] },
      { _id: db.createObjectID("57a533de11aa3f271d51a2af"),
        directParent: db.createObjectID("7980227254feb46736ca47fd"),
        globalIndex: 2,
        displayRaw: 'How many protons and neutrons does carbon have?',
        ckey: 'test-default-3-recall',
        extra_media: '',
        extra: '',
        display: '<p>Default note 3 question?</p>',
        level: 0.2,
        weight: 0.5,
        type: 'recall',
        order: 2,
        ctype: 'note',
        createdAt: "2016-08-06T00:48:29.339Z",
        __v: 0,
        parent: [] },
      { _id: db.createObjectID("57a533de11aa3f271d51a2b0"),
        directParent: db.createObjectID("7980227254feb46736ca47fd"),
        globalIndex: 2,
        displayRaw: 'How many protons and neutrons does carbon have?',
        ckey: 'test-default-3-recall',
        extra_media: '',
        extra: '',
        display: '<p>Default note 3 question?</p>',
        level: 0.2,
        weight: 0.5,
        type: 'recall',
        order: 2,
        ctype: 'note',
        createdAt: "2016-08-06T00:48:29.339Z",
        __v: 0,
        parent: [] }
       ],
    state: SessionState.INIT,
    globalIndex: 0
  }
}

before("before controller evaluator testing", function(t) {
  return db.setup().then(() => db.clean()).then(() => db.loadAllFixtures());
});

test("eval with init state", function(t) {
  let initSession = getSession();
  let mState = Immut.Map({
      'timestamp': 1,
      'senderID': '2028279607252615',
      'userID': '7716893a8c8aff3221812149',
      'input': {
        'type': Input.Type.CUSTOM,
        'data': 'hey!!'
      },
      'subjectName': 'crash-course-biology',
      'subjectID': db.createObjectID('f64c57184a4ef7f0357f9cd6'),
      'session': initSession
  });

  let mEvalState = Evaluator.eval(mState);
  let evalCtx = mEvalState.get('evalCtx');
  t.equal(evalCtx.answerQuality, Answer.ok);
  t.equal(evalCtx.doneNote, false);
  t.end();
});

test("eval with info state", function(t) {
  let initSession = getSession();
  initSession.state = SessionState.INFO;

  let mState = Immut.Map({
      'timestamp': 1,
      'senderID': '2028279607252615',
      'userID': '7716893a8c8aff3221812149',
      'input': {
        'type': Input.Type.ACCEPT,
        'data': null
      },
      'subjectName': 'crash-course-biology',
      'subjectID': db.createObjectID('f64c57184a4ef7f0357f9cd6'),
      'session': initSession
  });

  let mEvalState = Evaluator.eval(mState);
  let evalCtx = mEvalState.get('evalCtx');
  t.equal(evalCtx.answerQuality, Answer.ok);
  t.equal(evalCtx.doneNote, true);

  let mStateReject = Immut.Map({
      'timestamp': 1,
      'senderID': '2028279607252615',
      'userID': '7716893a8c8aff3221812149',
      'input': {
        'type': Input.Type.REJECT,
        'data': null
      },
      'subjectName': 'crash-course-biology',
      'subjectID': db.createObjectID('f64c57184a4ef7f0357f9cd6'),
      'session': initSession
  });

  let mEvalStateReject = Evaluator.eval(mStateReject);
  let evalCtxReject = mEvalStateReject.get('evalCtx');
  t.equal(evalCtxReject.answerQuality, null);
  t.equal(evalCtxReject.doneNote, false);
  t.end();
});

test("eval with recall state", function(t) {
  let initSession = getSession();
  initSession.state = SessionState.RECALL;
  initSession.queueIndex = 1;

  let mState = Immut.Map({
      'timestamp': 1,
      'senderID': '2028279607252615',
      'userID': '7716893a8c8aff3221812149',
      'input': {
        'type': Input.Type.ACCEPT,
        'data': null
      },
      'subjectName': 'crash-course-biology',
      'subjectID': db.createObjectID('f64c57184a4ef7f0357f9cd6'),
      'session': initSession
  });

  let mEvalState = Evaluator.eval(mState);
  let evalCtx= mEvalState.get('evalCtx');

  t.equal(mEvalState.get('session').state, SessionState.RECALL_RESPONSE)
  t.equal(mEvalState.get('session').queueIndex, 1);
  t.equal(evalCtx.answerQuality, Answer.ok);
  t.equal(evalCtx.doneNote, false);
  t.end();
});

test("eval with recall response state", function(t) {
  let initSession = getSession();
  initSession.state = SessionState.RECALL_RESPONSE;
  initSession.queueIndex = 1;

  let mState = Immut.Map({
      'timestamp': 1,
      'senderID': '2028279607252615',
      'userID': '7716893a8c8aff3221812149',
      'input': {
        'type': Input.Type.ACCEPT,
        'data': null
      },
      'subjectName': 'crash-course-biology',
      'subjectID': db.createObjectID('f64c57184a4ef7f0357f9cd6'),
      'session': initSession
  });

  let mEvalState = Evaluator.eval(mState);
  let evalCtx = mEvalState.get('evalCtx');
  t.equal(evalCtx.answerQuality, Answer.max);
  t.equal(evalCtx.doneNote, true);

  let mStateReject = Immut.Map({
      'timestamp': 1,
      'senderID': '2028279607252615',
      'userID': '7716893a8c8aff3221812149',
      'input': {
        'type': Input.Type.REJECT,
        'data': null
      },
      'subjectName': 'crash-course-biology',
      'subjectID': db.createObjectID('f64c57184a4ef7f0357f9cd6'),
      'session': initSession
  });

  let mEvalStateReject = Evaluator.eval(mStateReject);
  let evalCtxReject = mEvalStateReject.get('evalCtx');
  t.equal(evalCtxReject.answerQuality, Answer.min);
  t.equal(evalCtxReject.doneNote, true);


  t.end();
});

test("eval with choice state", function(t) {
  let initSession = getSession();
  initSession.state = SessionState.MULT_CHOICE;
  initSession.queueIndex = 2;

  let mState = Immut.Map({
      'timestamp': 1,
      'senderID': '2028279607252615',
      'userID': '7716893a8c8aff3221812149',
      'input': {
        'type': Input.Type.CUSTOM,
        'data': 3
      },
      'subjectName': 'crash-course-biology',
      'subjectID': db.createObjectID('f64c57184a4ef7f0357f9cd6'),
      'session': initSession
  });

  let mEvalState = Evaluator.eval(mState);
  let evalCtx = mEvalState.get('evalCtx');
  t.equal(evalCtx.answerQuality, Answer.max);
  t.equal(evalCtx.doneNote, true);

  // check if string data '3' is properly accepted
  // as correct answer choice 3
  let mStateString = Immut.Map({
      'timestamp': 1,
      'senderID': '2028279607252615',
      'userID': '7716893a8c8aff3221812149',
      'input': {
        'type': Input.Type.CUSTOM,
        'data': '3'
      },
      'subjectName': 'crash-course-biology',
      'subjectID': db.createObjectID('f64c57184a4ef7f0357f9cd6'),
      'session': initSession
  });

  let mEvalStateString = Evaluator.eval(mStateString);
  let evalCtxString = mEvalStateString.get('evalCtx');
  t.equal(evalCtxString.answerQuality, Answer.max);
  t.equal(evalCtxString.doneNote, true);

  // check if incorrect answer is correctly evaluated as wrong
  let mStateWrong = Immut.Map({
      'timestamp': 1,
      'senderID': '2028279607252615',
      'userID': '7716893a8c8aff3221812149',
      'input': {
        'type': Input.Type.CUSTOM,
        'data': 2
      },
      'subjectName': 'crash-course-biology',
      'subjectID': db.createObjectID('f64c57184a4ef7f0357f9cd6'),
      'session': initSession
  });

  let mEvalStateWrong = Evaluator.eval(mStateWrong);
  let evalCtxWrong = mEvalStateWrong.get('evalCtx');
  t.equal(evalCtxWrong.answerQuality, Answer.min);
  t.equal(evalCtxWrong.doneNote, true);

  // check if incorrect answer string is correctly evaluated as wrong
  let mStateWrongString = Immut.Map({
      'timestamp': 1,
      'senderID': '2028279607252615',
      'userID': '7716893a8c8aff3221812149',
      'input': {
        'type': Input.Type.CUSTOM,
        'data': '5'
      },
      'subjectName': 'crash-course-biology',
      'subjectID': db.createObjectID('f64c57184a4ef7f0357f9cd6'),
      'session': initSession
  });

  let mEvalStateWrongString = Evaluator.eval(mStateWrongString);
  let evalCtxWrongString = mEvalStateWrongString.get('evalCtx');
  t.equal(evalCtxWrongString.answerQuality, Answer.min);
  t.equal(evalCtxWrongString.doneNote, true);
  t.end();

});

test("eval with input state", function(t) {
  let initSession = getSession();
  initSession.state = SessionState.INPUT;
  initSession.queueIndex = 3;

  let mState = Immut.Map({
      'timestamp': 1,
      'senderID': '2028279607252615',
      'userID': '7716893a8c8aff3221812149',
      'input': {
        'type': Input.Type.CUSTOM,
        'data': 'valence'
      },
      'subjectName': 'crash-course-biology',
      'subjectID': db.createObjectID('f64c57184a4ef7f0357f9cd6'),
      'session': initSession
  });

  let mEvalState = Evaluator.eval(mState);
  let evalCtx = mEvalState.get('evalCtx');
  t.equal(evalCtx.answerQuality, Answer.max);
  t.equal(evalCtx.doneNote, true);

  // check if incorrect answer is correctly evaluated as wrong
  let mStateWrong = Immut.Map({
      'timestamp': 1,
      'senderID': '2028279607252615',
      'userID': '7716893a8c8aff3221812149',
      'input': {
        'type': Input.Type.CUSTOM,
        'data': 'hydrogen'
      },
      'subjectName': 'crash-course-biology',
      'subjectID': db.createObjectID('f64c57184a4ef7f0357f9cd6'),
      'session': initSession
  });

  let mEvalStateWrong = Evaluator.eval(mStateWrong);
  let evalCtxWrong = mEvalStateWrong.get('evalCtx');
  t.equal(evalCtxWrong.answerQuality, Answer.min);
  t.equal(evalCtxWrong.doneNote, true);

  t.end();

});

after("after controller evaluator testing", function(t) {
  return db.close();
});
