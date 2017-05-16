/* eslint-disable max-len */

import test from 'blue-tape';
import pipeEval from '~/controller/pipe_eval';
import { SessionState } from '~/core/session_state';
import Input from '~/core/input';
import Answer from '~/core/answer';
import { EvalStatus } from '~/core/eval';
import TestDatabase from './test_database';
import TestConst from './test_const';

const before = test;
const after = test;
const db = new TestDatabase();

const SUBJECT_NAME = TestConst.SUBJECT_NAME;

function getSession(queueIndex = 0, state) {
  return {
    queueIndex,
    startSessionTime: new Date(),
    noteQueue: [
      {
        _id: db.createObjectID('9e16c772556579bd6fc6c222'),
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
        parent: [],
      },
      {
        _id: db.createObjectID('987e8177faf2c2f03c974482'),
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
        paths: [
          {
            display: 'polar bonds?',
            catName: 'polar-covalent-bond',
            catId: '2980227254feb46732ca491e',
          },
          {
            display: 'electron?',
            catName: 'electron-shell',
            catId: '7980227254feb46736ca47fd',
          }
        ],
        __v: 0,
        parent: [],
      },
      {
        _id: db.createObjectID('ff7cbfb397fb2794827739ad'),
        createdAt: '2016-04-15T00:36:56.879Z',
        ctype: 'note',
        order: 9,
        type: 'choice',
        weight: 1,
        level: 0.8,
        display: '<p>A polar covalent bond leads to what?</p>',
        extra: '',
        extra_media: '',
        parent: [],
        ckey: 'polar-covalent-bond',
        displayRaw: 'A polar covalent bond leads to what?',
        choice1: 'equal sharing of electrons',
        choice2: 'sharing of electrons between molecules',
        choice3: 'slightly charged sides of a molecule',
        choice4: 'no sharing of charges',
        choice5: 'sharing of neutrons between molecules',
        answer: 3,
        hidden: 'Polar covalent bonds have unequal sharing of electrons, so some sides of molecules will be more negatively charged and some more positively charged.',
        globalIndex: 65,
        subjectParent: db.createObjectID('f64c57184a4ef7f0357f9cd6'),
        directParent: db.createObjectID('f9e515b670e5b8de9210872e'),
        phrase: {
          pre: [],
        },
        label: '',
      },
      {
        _id: db.createObjectID('1abf784a870127cca006e09c'),
        createdAt: '2016-04-13T17:16:38.076Z',
        ctype: 'note',
        order: 4,
        type: 'input',
        weight: 0.5,
        level: 0.5,
        display: '<p>what the outermost filled electron shell is called?</p>',
        extra: '',
        extra_media: '',
        parent: [],
        ckey: 'atomic-shell-valence',
        displayRaw: 'what the outermost filled electron shell is called?',
        answer: 'valence',
        hidden: 'Remember that an atom likes to get together with other atoms just so it can share and exchange electrons with them and fill this valence shell.',
        phrase: {
          pre: ['Do you remember', 'Can you tell me'],
        },
        globalIndex: 26,
        subjectParent: db.createObjectID('f64c57184a4ef7f0357f9cd6'),
        directParent: db.createObjectID('f9e515b670e5b8de9210872e'),
        label: '',
      },
      {
        _id: db.createObjectID('57a533de11aa3f271d51a2ab'),
        directParent: db.createObjectID('7980227254feb46736ca47fd'),
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
        createdAt: '2016-08-06T00:48:29.339Z',
        __v: 0,
        parent: [],
      },
      {
        _id: db.createObjectID('57a533de11aa3f271d51a2ac'),
        directParent: db.createObjectID('7980227254feb46736ca47fd'),
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
        createdAt: '2016-08-06T00:48:29.339Z',
        __v: 0,
        parent: [],
      },
      {
        _id: db.createObjectID('57a533de11aa3f271d51a2ad'),
        directParent: db.createObjectID('7980227254feb46736ca47fd'),
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
        createdAt: '2016-08-06T00:48:29.339Z',
        __v: 0,
        parent: [],
      },
      {
        _id: db.createObjectID('57a533de11aa3f271d51a2ae'),
        directParent: db.createObjectID('7980227254feb46736ca47fd'),
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
        createdAt: '2016-08-06T00:48:29.339Z',
        __v: 0,
        parent: [],
      },
      {
        _id: db.createObjectID('57a533de11aa3f271d51a2af'),
        directParent: db.createObjectID('7980227254feb46736ca47fd'),
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
        createdAt: '2016-08-06T00:48:29.339Z',
        __v: 0,
        parent: [],
      },
      {
        _id: db.createObjectID('57a533de11aa3f271d51a2b0'),
        directParent: db.createObjectID('7980227254feb46736ca47fd'),
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
        createdAt: '2016-08-06T00:48:29.339Z',
        __v: 0,
        parent: [],
      },
      {
        _id: db.createObjectID('1abf784a870127cca006e02a'),
        createdAt: '2016-04-13T17:16:38.076Z',
        ctype: 'note',
        order: 4,
        type: 'input',
        weight: 0.5,
        level: 0.5,
        display: '<p>the three main particles you find in an atom?</p>',
        extra: '',
        extra_media: '',
        parent: [],
        ckey: 'atomic-shell-valence',
        displayRaw: 'the three main particles you find in an atom?',
        answer: 'electrons, protons, and neutrons',
        phrase: {
          pre: ['Do you remember', 'Can you tell me'],
        },
        globalIndex: 26,
        subjectParent: db.createObjectID('f64c57184a4ef7f0357f9cd6'),
        directParent: db.createObjectID('f9e515b670e5b8de9210872e'),
        label: '',
      },
      {
        _id: db.createObjectID('1abf784a870127cca006e02a'),
        createdAt: '2016-04-13T17:16:38.076Z',
        ctype: 'note',
        order: 4,
        type: 'input',
        weight: 0.5,
        level: 0.5,
        display: '<p>the three particle types you find in an atom?</p>',
        extra: '',
        extra_media: '',
        parent: [],
        ckey: 'atomic-shell-valence',
        displayRaw: 'three particle types you find in an atom?',
        answer: 'neutrons, protons, and electrons || gluons',
        phrase: {
          pre: ['Do you remember', 'Can you tell me'],
        },
        globalIndex: 26,
        subjectParent: db.createObjectID('f64c57184a4ef7f0357f9cd6'),
        directParent: db.createObjectID('f9e515b670e5b8de9210872e'),
        label: '',
      },
      {
        _id: db.createObjectID('1abf784a870127cca006e02a'),
        createdAt: '2016-04-13T17:16:38.076Z',
        ctype: 'note',
        order: 4,
        type: 'input',
        weight: 0.5,
        level: 0.5,
        display: '<p>What kind of color is blue?</p>',
        extra: '',
        extra_media: '',
        parent: [],
        ckey: 'atomic-shell-valence',
        displayRaw: 'what kind of color is blue?',
        answer: 'primary || cool',
        phrase: {
          pre: ['Do you remember', 'Can you tell me'],
        },
        globalIndex: 26,
        subjectParent: db.createObjectID('f64c57184a4ef7f0357f9cd6'),
        directParent: db.createObjectID('f9e515b670e5b8de9210872e'),
        label: '',
      }
    ],
    state,
    globalIndex: 0,
  };
}

function getAppState(session, input) {
  return {
    timestamp: 1,
    senderID: '2028279607252615',
    userID: '7716893a8c8aff3221812149',
    subjectName: SUBJECT_NAME,
    subjectID: db.createObjectID('f64c57184a4ef7f0357f9cd6'),
    input,
    session,
  };
}

before('before controller pipe evaluator testing', () =>
  db.setup().then(() => db.clean()).then(() => db.loadAllFixtures()));

test('eval with init state', t => {
  const appState = getAppState(getSession(0, SessionState.INIT), {
    type: Input.Type.CUSTOM,
    payload: 'hey!',
  });
  const mEvalState = pipeEval(appState);
  const evalCtx = mEvalState.evalCtx;
  t.equal(mEvalState.session.state, SessionState.INIT);
  t.equal(evalCtx.answerQuality, Answer.ok);
  t.equal(evalCtx.correctAnswer, null);
  t.equal(evalCtx.status, EvalStatus.SUCCESS);
  t.end();
});

// -------- INFO ---------------------------------------------------
test('eval with INFO state and correct input', t => {
  const appState = getAppState(getSession(0, SessionState.INFO), {
    type: Input.Type.ACCEPT,
    payload: null,
  });
  const mEvalState = pipeEval(appState);
  const evalCtx = mEvalState.evalCtx;
  t.equal(mEvalState.session.state, SessionState.INFO);
  t.equal(evalCtx.answerQuality, Answer.ok);
  t.equal(evalCtx.correctAnswer, null);
  t.equal(evalCtx.status, EvalStatus.SUCCESS);
  t.end();
});

test('eval with INFO state and random custom input', t => {
  const appState = getAppState(getSession(0, SessionState.INFO), {
    type: Input.Type.CUSTOM,
    payload: 'cool story dude',
  });
  const mEvalState = pipeEval(appState);
  const evalCtx = mEvalState.evalCtx;
  t.equal(mEvalState.session.state, SessionState.INFO);
  t.equal(evalCtx.answerQuality, Answer.ok);
  t.equal(evalCtx.correctAnswer, null);
  t.equal(evalCtx.status, EvalStatus.SUCCESS);
  t.end();
});

test('eval with INFO state and invalid input', t => {
  const appState = getAppState(getSession(0, SessionState.INFO), {
    type: Input.Type.REJECT,
    payload: null,
  });
  const mEvalState = pipeEval(appState);
  const evalCtx = mEvalState.evalCtx;
  t.equal(mEvalState.session.state, SessionState.INFO);
  t.equal(evalCtx.answerQuality, null);
  t.equal(evalCtx.correctAnswer, null);
  t.equal(evalCtx.status, EvalStatus.INVALID);
  t.end();
});

// --------- RECALL -----------------------------------------------
test('eval with RECALL state and correct input', t => {
  const appState = getAppState(getSession(1, SessionState.RECALL), {
    type: Input.Type.ACCEPT,
    payload: null,
  });
  const mEvalState = pipeEval(appState);
  const evalCtx = mEvalState.evalCtx;
  t.equal(mEvalState.session.state, SessionState.RECALL);
  t.equal(evalCtx.answerQuality, Answer.ok);
  t.equal(evalCtx.correctAnswer, null);
  t.equal(evalCtx.status, EvalStatus.SUCCESS);
  t.end();
});

test('eval with RECALL state and random custom input', t => {
  const appState = getAppState(getSession(1, SessionState.RECALL), {
    type: Input.Type.CUSTOm,
    payload: 'hallooo',
  });
  const mEvalState = pipeEval(appState);
  const evalCtx = mEvalState.evalCtx;
  t.equal(mEvalState.session.state, SessionState.RECALL);
  t.equal(evalCtx.answerQuality, Answer.ok);
  t.equal(evalCtx.correctAnswer, null);
  t.equal(evalCtx.status, EvalStatus.SUCCESS);
  t.end();
});

test('eval with RECALL state and invalid input', t => {
  const appState = getAppState(getSession(1, SessionState.RECALL), {
    type: Input.Type.REJECT, // invalid input
    payload: null,
  });
  const mEvalState = pipeEval(appState);
  const evalCtx = mEvalState.evalCtx;
  t.equal(mEvalState.session.state, SessionState.RECALL);
  t.equal(evalCtx.answerQuality, null);
  t.equal(evalCtx.correctAnswer, null);
  t.equal(evalCtx.status, EvalStatus.INVALID);
  t.end();
});

test('eval with RECALL_RESPONSE state and success text input', t => {
  const appState = getAppState(getSession(1, SessionState.RECALL_RESPONSE), {
    type: Input.Type.CUSTOM,
    payload: 'yes',
  });
  const mEvalState = pipeEval(appState);
  const evalCtx = mEvalState.evalCtx;
  t.equal(mEvalState.session.state, SessionState.RECALL_RESPONSE);
  t.equal(evalCtx.answerQuality, Answer.ok);
  t.equal(evalCtx.correctAnswer, null);
  t.equal(evalCtx.status, EvalStatus.SUCCESS);
  t.end();
});

test('eval with RECALL_RESPONSE state and fail text input', t => {
  const appState = getAppState(getSession(1, SessionState.RECALL_RESPONSE), {
    type: Input.Type.CUSTOM,
    payload: 'no',
  });
  const mEvalState = pipeEval(appState);
  const evalCtx = mEvalState.evalCtx;
  t.equal(mEvalState.session.state, SessionState.RECALL_RESPONSE);
  t.equal(evalCtx.answerQuality, Answer.min);
  t.equal(evalCtx.correctAnswer, null);
  t.equal(evalCtx.status, EvalStatus.SUCCESS);
  t.end();
});

test('eval with RECALL_RESPONSE state and correct input', t => {
  const appState = getAppState(getSession(1, SessionState.RECALL_RESPONSE), {
    type: Input.Type.ACCEPT,
    payload: null,
  });
  const mEvalState = pipeEval(appState);
  const evalCtx = mEvalState.evalCtx;
  t.equal(mEvalState.session.state, SessionState.RECALL_RESPONSE);
  t.equal(evalCtx.answerQuality, Answer.ok);
  t.equal(evalCtx.correctAnswer, null);
  t.equal(evalCtx.status, EvalStatus.SUCCESS);
  t.end();
});

test('eval with RECALL_RESPONSE state and incorrect input', t => {
  const appState = getAppState(getSession(1, SessionState.RECALL_RESPONSE), {
    type: Input.Type.REJECT,
    payload: null,
  });

  const mEvalState = pipeEval(appState);
  const evalCtx = mEvalState.evalCtx;
  t.equal(mEvalState.session.state, SessionState.RECALL_RESPONSE);
  t.equal(evalCtx.answerQuality, Answer.min);
  t.equal(evalCtx.correctAnswer, null);
  t.equal(evalCtx.status, EvalStatus.SUCCESS);
  t.end();
});

test('eval with RECALL_RESPONSE state and unknown text input', t => {
  const appState = getAppState(getSession(1, SessionState.RECALL_RESPONSE), {
    type: Input.Type.CUSTOM,
    payload: 'halloooo',
  });

  const mEvalState = pipeEval(appState);
  const evalCtx = mEvalState.evalCtx;
  t.equal(mEvalState.session.state, SessionState.RECALL_RESPONSE);
  t.equal(evalCtx.answerQuality, null);
  t.equal(evalCtx.correctAnswer, null);
  t.equal(evalCtx.status, EvalStatus.INVALID);
  t.end();
});

test('eval with RECALL_RESPONSE state and invalid input', t => {
  const appState = getAppState(getSession(1, SessionState.RECALL_RESPONSE), {
    type: Input.Type.CUSTOM,
    payload: null,
  });

  const mEvalState = pipeEval(appState);
  const evalCtx = mEvalState.evalCtx;
  t.equal(mEvalState.session.state, SessionState.RECALL_RESPONSE);
  t.equal(evalCtx.answerQuality, null);
  t.equal(evalCtx.correctAnswer, null);
  t.equal(evalCtx.status, EvalStatus.INVALID);
  t.end();
});

test('eval with CHOICE state and correct input', t => {
  const appState = getAppState(getSession(2, SessionState.MULT_CHOICE), {
    type: Input.Type.CUSTOM,
    payload: 3,
  });
  const mEvalState = pipeEval(appState);
  const evalCtx = mEvalState.evalCtx;
  t.equal(mEvalState.session.state, SessionState.MULT_CHOICE);
  t.equal(evalCtx.answerQuality, Answer.max);
  t.equal(evalCtx.correctAnswer, '(3) slightly charged sides of a molecule');
  t.equal(evalCtx.status, EvalStatus.SUCCESS);
  t.end();
});

// check if string data '3' is properly accepted
// as correct answer choice 3
test('eval with CHOICE state and correct string input', t => {
  const appState = getAppState(getSession(2, SessionState.MULT_CHOICE), {
    type: Input.Type.CUSTOM,
    payload: '3',
  });

  const mEvalState = pipeEval(appState);
  const evalCtx = mEvalState.evalCtx;
  t.equal(mEvalState.session.state, SessionState.MULT_CHOICE);
  t.equal(evalCtx.answerQuality, Answer.max);
  t.equal(evalCtx.correctAnswer, '(3) slightly charged sides of a molecule');
  t.equal(evalCtx.status, EvalStatus.SUCCESS);
  t.end();
});

test('eval with CHOICE state and incorrect input', t => {
  const appState = getAppState(getSession(2, SessionState.MULT_CHOICE), {
    type: Input.Type.CUSTOM,
    payload: 2,
  });
  const mEvalState = pipeEval(appState);
  const evalCtx = mEvalState.evalCtx;
  t.equal(mEvalState.session.state, SessionState.MULT_CHOICE);
  t.equal(evalCtx.answerQuality, Answer.min);
  t.equal(evalCtx.correctAnswer, '(3) slightly charged sides of a molecule');
  t.equal(evalCtx.status, EvalStatus.SUCCESS);
  t.end();
});

test('eval with CHOICE state and incorrect string input', t => {
  const appState = getAppState(getSession(2, SessionState.MULT_CHOICE), {
    type: Input.Type.CUSTOM,
    payload: '5',
  });
  const mEvalState = pipeEval(appState);
  const evalCtx = mEvalState.evalCtx;
  t.equal(mEvalState.session.state, SessionState.MULT_CHOICE);
  t.equal(evalCtx.answerQuality, Answer.min);
  t.equal(evalCtx.correctAnswer, '(3) slightly charged sides of a molecule');
  t.equal(evalCtx.status, EvalStatus.SUCCESS);
  t.end();
});

test('eval with CHOICE state and invalid input', t => {
  const appState = getAppState(getSession(2, SessionState.MULT_CHOICE), {
    type: Input.Type.ACCEPT,
    payload: '5',
  });
  const mEvalState = pipeEval(appState);
  const evalCtx = mEvalState.evalCtx;
  t.equal(mEvalState.session.state, SessionState.MULT_CHOICE);
  t.equal(evalCtx.answerQuality, null);
  t.equal(evalCtx.correctAnswer, '(3) slightly charged sides of a molecule');
  t.equal(evalCtx.status, EvalStatus.INVALID);
  t.end();
});

test('eval with CHOICE state and another invalid input', t => {
  const appState = getAppState(getSession(2, SessionState.MULT_CHOICE), {
    type: Input.Type.REJECT,
    payload: '5',
  });
  const mEvalState = pipeEval(appState);
  const evalCtx = mEvalState.evalCtx;
  t.equal(mEvalState.session.state, SessionState.MULT_CHOICE);
  t.equal(evalCtx.answerQuality, null);
  t.equal(evalCtx.correctAnswer, '(3) slightly charged sides of a molecule');
  t.equal(evalCtx.status, EvalStatus.INVALID);
  t.end();
});

test('eval with INPUT state and correct input', t => {
  const appState = getAppState(getSession(3, SessionState.INPUT), {
    type: Input.Type.CUSTOM,
    payload: 'valence',
  });
  const mEvalState = pipeEval(appState);
  const evalCtx = mEvalState.evalCtx;
  t.equal(mEvalState.session.state, SessionState.INPUT);
  t.equal(evalCtx.answerQuality, Answer.max);
  t.equal(evalCtx.correctAnswer, 'valence');
  t.equal(evalCtx.status, EvalStatus.SUCCESS);
  t.end();
});

// check if incorrect answer has proper evaluation as incorrect
test('eval with INPUT state and incorrect input', t => {
  const appState = getAppState(getSession(3, SessionState.INPUT), {
    type: Input.Type.CUSTOM,
    payload: 'hydrogen',
  });
  const mEvalState = pipeEval(appState);
  const evalCtx = mEvalState.evalCtx;
  t.equal(mEvalState.session.state, SessionState.INPUT);
  t.equal(evalCtx.answerQuality, Answer.min);
  t.equal(evalCtx.correctAnswer, 'valence');
  t.equal(evalCtx.status, EvalStatus.SUCCESS);
  t.end();
});

test('eval with INPUT state and invalid input', t => {
  const appState = getAppState(getSession(3, SessionState.INPUT), {
    type: Input.Type.ACCEPT,
    payload: 'hydrogen',
  });
  const mEvalState = pipeEval(appState);
  const evalCtx = mEvalState.evalCtx;
  t.equal(mEvalState.session.state, SessionState.INPUT);
  t.equal(evalCtx.answerQuality, null);
  t.equal(evalCtx.correctAnswer, 'valence');
  t.equal(evalCtx.status, EvalStatus.INVALID);
  t.end();
});

test('eval with INPUT state and another invalid input', t => {
  const appState = getAppState(getSession(3, SessionState.INPUT), {
    type: Input.Type.REJECT,
    payload: 'hydrogen',
  });
  const mEvalState = pipeEval(appState);
  const evalCtx = mEvalState.evalCtx;
  t.equal(mEvalState.session.state, SessionState.INPUT);
  t.equal(evalCtx.answerQuality, null);
  t.equal(evalCtx.correctAnswer, 'valence');
  t.equal(evalCtx.status, EvalStatus.INVALID);
  t.end();
});

test('eval with INPUT state and correct multi (AND logic) inputs', t => {
  const correctResp = [
    'protons neutrons electrons',
    'protons neutrons, electrons',
    'protons electrons neutrons protons electrons neutrons',
    'protons, neutrons, electrons',
    'neutrons, protons, electrons',
    'neutrons and protons and electrons'
  ];

  for (const resp of correctResp) {
    const appState = getAppState(getSession(10, SessionState.INPUT), {
      type: Input.Type.CUSTOM,
      payload: resp,
    });
    const mEvalState = pipeEval(appState);
    const evalCtx = mEvalState.evalCtx;
    t.equal(mEvalState.session.state, SessionState.INPUT);
    t.equal(evalCtx.answerQuality, Answer.max);
    t.equal(evalCtx.status, EvalStatus.SUCCESS);
  }

  t.end();
});

test('eval with INPUT state and correct multi (AND logic with OR logic) inputs', t => {
  const correctResp = [
    'protons neutrons electrons',
    'protons neutrons gluons',
    'protons electrons neutrons protons electrons neutrons',
    'protons gluons neutrons protons gluons neutrons',
    'protons, neutrons, electrons',
    'protons, neutrons, gluons',
    'neutrons and protons and electrons',
    'neutrons and protons and gluons'
  ];

  for (const resp of correctResp) {
    const appState = getAppState(getSession(11, SessionState.INPUT), {
      type: Input.Type.CUSTOM,
      payload: resp,
    });
    const mEvalState = pipeEval(appState);
    const evalCtx = mEvalState.evalCtx;
    t.equal(mEvalState.session.state, SessionState.INPUT);
    t.equal(evalCtx.answerQuality, Answer.max);
    t.equal(evalCtx.status, EvalStatus.SUCCESS);
  }

  t.end();
});

test('eval with INPUT state and incorrect multi (AND logic) inputs', t => {
  const incorrectResp = [
    'electrons',
    'protons neutrons',
    'quarks neutrons electrons',
    'protons, quarks, electrons',
    'neutrons, protons, quarks',
    'neutrons and quarks and electrons'
  ];

  for (const resp of incorrectResp) {
    const appState = getAppState(getSession(10, SessionState.INPUT), {
      type: Input.Type.CUSTOM,
      payload: resp,
    });
    const mEvalState = pipeEval(appState);
    const evalCtx = mEvalState.evalCtx;
    t.equal(mEvalState.session.state, SessionState.INPUT);
    t.equal(evalCtx.answerQuality, Answer.min);
    t.equal(evalCtx.status, EvalStatus.SUCCESS);
  }

  t.end();
});

test('eval with INPUT state and correct multi (OR logic) inputs', t => {
  const correctResp = ['primary', 'cool', '  primary ', ' cool    ', ' primary and cool'];

  for (const resp of correctResp) {
    const appState = getAppState(getSession(12, SessionState.INPUT), {
      type: Input.Type.CUSTOM,
      payload: resp,
    });
    const mEvalState = pipeEval(appState);
    const evalCtx = mEvalState.evalCtx;
    t.equal(mEvalState.session.state, SessionState.INPUT);
    t.equal(evalCtx.answerQuality, Answer.max);
    t.equal(evalCtx.status, EvalStatus.SUCCESS);
  }

  t.end();
});

test('eval with INPUT state and incorrect multi (OR logic) inputs', t => {
  const incorrectResp = ['protons', 'cat', '  dog ', ' protons    '];

  for (const resp of incorrectResp) {
    const appState = getAppState(getSession(12, SessionState.INPUT), {
      type: Input.Type.CUSTOM,
      payload: resp,
    });
    const mEvalState = pipeEval(appState);
    const evalCtx = mEvalState.evalCtx;
    t.equal(mEvalState.session.state, SessionState.INPUT);
    t.equal(evalCtx.answerQuality, Answer.min);
    t.equal(evalCtx.status, EvalStatus.SUCCESS);
  }

  t.end();
});

test('eval with INPUT state and input with leading articles', t => {
  const correctResp = [
    'the primary',
    'the cool',
    ' a  the an   primary ',
    ' a cool  ',
    ' an primary the',
    'an cool the'
  ];

  for (const resp of correctResp) {
    const appState = getAppState(getSession(12, SessionState.INPUT), {
      type: Input.Type.CUSTOM,
      payload: resp,
    });
    const mEvalState = pipeEval(appState);
    const evalCtx = mEvalState.evalCtx;
    t.equal(mEvalState.session.state, SessionState.INPUT);
    t.equal(evalCtx.answerQuality, Answer.max);
    t.equal(evalCtx.status, EvalStatus.SUCCESS);
  }

  t.end();
});

test('eval with SHOW_PATHS state with valid input skipping paths', t => {
  const appState = getAppState(getSession(1, SessionState.SHOW_PATHS), {
    type: Input.Type.ACCEPT,
  });
  const mEvalState = pipeEval(appState);
  const evalCtx = mEvalState.evalCtx;
  t.equal(mEvalState.session.state, SessionState.SHOW_PATHS);
  t.equal(evalCtx.answerQuality, Answer.max);
  t.equal(evalCtx.status, EvalStatus.SUCCESS);
  t.end();
});

test('eval with SHOW_PATHS state with valid input', t => {
  const appState = getAppState(getSession(1, SessionState.SHOW_PATHS), {
    type: Input.Type.PATH,
    payload: '0',
  });
  const mEvalState = pipeEval(appState);
  const evalCtx = mEvalState.evalCtx;
  t.equal(mEvalState.session.state, SessionState.SHOW_PATHS);
  t.equal(evalCtx.answerQuality, Answer.max);
  t.ok(evalCtx.correctAnswer);
  t.equal(evalCtx.status, EvalStatus.SUCCESS);
  t.end();
});

test('eval with SHOW_PATHS state with valid input for note no paths', t => {
  const appState = getAppState(getSession(0, SessionState.SHOW_PATHS), {
    type: Input.Type.PATH,
    payload: '0',
  });
  const mEvalState = pipeEval(appState);
  const evalCtx = mEvalState.evalCtx;
  t.equal(mEvalState.session.state, SessionState.SHOW_PATHS);
  t.equal(evalCtx.answerQuality, null);
  t.equal(evalCtx.status, EvalStatus.INVALID);
  t.end();
});

test('eval with SHOW_PATHS state with invalid input', t => {
  const appState = getAppState(getSession(1, SessionState.SHOW_PATHS), {
    type: Input.Type.CUSTOM,
    payload: '3',
  });
  const mEvalState = pipeEval(appState);
  const evalCtx = mEvalState.evalCtx;
  t.equal(mEvalState.session.state, SessionState.SHOW_PATHS);
  t.equal(evalCtx.answerQuality, null);
  t.equal(evalCtx.status, EvalStatus.INVALID);
  t.end();
});

test('eval with DONE_QUEUE state and valid input but not enough waited time', t => {
  const appState = getAppState(getSession(10, SessionState.DONE_QUEUE), {
    type: Input.Type.CUSTOM,
    payload: 'keep going!',
  });
  const mEvalState = pipeEval(appState);
  const evalCtx = mEvalState.evalCtx;
  t.equal(mEvalState.session.state, SessionState.DONE_QUEUE);
  t.equal(evalCtx.answerQuality, Answer.min);
  t.equal(evalCtx.status, EvalStatus.SUCCESS);
  t.end();
});

test('eval with DONE_QUEUE state and valid input and dev loophole', t => {
  const appState = getAppState(getSession(10, SessionState.DONE_QUEUE), {
    type: Input.Type.CUSTOM,
    payload: '1',
  });
  const mEvalState = pipeEval(appState);
  const evalCtx = mEvalState.evalCtx;
  t.equal(mEvalState.session.state, SessionState.DONE_QUEUE);
  t.equal(evalCtx.answerQuality, Answer.max);
  t.equal(evalCtx.status, EvalStatus.SUCCESS);
  t.end();
});

after('after controller pipe evaluator testing', () => db.close());
