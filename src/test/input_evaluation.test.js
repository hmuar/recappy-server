import test from 'blue-tape';
import { evalNoteWithRawInput } from '~/core/eval';

test('Input evaluation with numbers', t => {
  let note = { answer: 'three', };
  // let successResp = ['three??', 'Three', '3 maybe', 'trheee'];
  t.equal(evalNoteWithRawInput('three??', note), true);
  t.equal(evalNoteWithRawInput('Three', note), true);
  t.equal(evalNoteWithRawInput('3 maybe', note), true);
  t.equal(evalNoteWithRawInput('trheeee', note), true);
  t.equal(evalNoteWithRawInput('tree', note), true);
  t.equal(evalNoteWithRawInput('ten', note), false);
  t.equal(evalNoteWithRawInput('house', note), false);
  t.equal(evalNoteWithRawInput('ok', note), false);
  note = { answer: '2', };
  t.equal(evalNoteWithRawInput('two', note), true);
  t.equal(evalNoteWithRawInput('its two!?', note), true);
  t.equal(evalNoteWithRawInput('tow', note), true);
  t.end();
});

test('Input evaluation with extra words', t => {
  let note = { answer: 'H', };
  // let successResp = ['three??', 'Three', '3 maybe', 'trheee'];
  t.equal(evalNoteWithRawInput('h', note), true);
  t.equal(evalNoteWithRawInput('two H', note), true);
  t.equal(evalNoteWithRawInput('two h', note), true);
  t.equal(evalNoteWithRawInput('O', note), false);
  t.equal(evalNoteWithRawInput('e', note), false);
  t.equal(evalNoteWithRawInput('ho', note), false);
  note = { answer: 'valence', };
  // let successResp = ['three??', 'Three', '3 maybe', 'trheee'];
  t.equal(evalNoteWithRawInput('valence shell', note), true);
  t.equal(evalNoteWithRawInput('velence shell', note), true);
  t.equal(evalNoteWithRawInput('inner shell', note), false);
  t.equal(evalNoteWithRawInput('outer shell', note), false);
  t.end();
});

test('Input evaluation with misspelling', t => {
  let note = { answer: 'Valence', };
  // let successResp = ['three??', 'Three', '3 maybe', 'trheee'];
  t.equal(evalNoteWithRawInput('valnce', note), true);
  t.equal(evalNoteWithRawInput('velence', note), true);
  t.equal(evalNoteWithRawInput('valencee', note), true);
  t.equal(evalNoteWithRawInput('vaelence', note), true);
  t.equal(evalNoteWithRawInput('inner', note), false);
  t.equal(evalNoteWithRawInput('outer', note), false);
  t.equal(evalNoteWithRawInput('vielence', note), false);
  t.end();
});

test('Input evaluation with symbols', t => {
  let note = { answer: 'positive || pos || +', };
  // let successResp = ['three??', 'Three', '3 maybe', 'trheee'];
  t.equal(evalNoteWithRawInput('positive', note), true);
  t.equal(evalNoteWithRawInput('positivity', note), true);
  t.equal(evalNoteWithRawInput('pos', note), true);
  t.equal(evalNoteWithRawInput('+', note), true);
  t.equal(evalNoteWithRawInput('-', note), false);
  t.equal(evalNoteWithRawInput('negative', note), false);
  t.equal(evalNoteWithRawInput('neg', note), false);
  t.equal(evalNoteWithRawInput('neutral', note), false);
  t.equal(evalNoteWithRawInput('no', note), false);

  note = { answer: 'negative || neg || -', };
  // let successResp = ['three??', 'Three', '3 maybe', 'trheee'];
  t.equal(evalNoteWithRawInput('negativity', note), true);
  t.equal(evalNoteWithRawInput('negative', note), true);
  t.equal(evalNoteWithRawInput('neg', note), true);
  t.equal(evalNoteWithRawInput('-', note), true);
  t.equal(evalNoteWithRawInput('+', note), false);
  t.equal(evalNoteWithRawInput('positive', note), false);
  t.equal(evalNoteWithRawInput('pos', note), false);
  t.equal(evalNoteWithRawInput('neutral', note), false);
  t.equal(evalNoteWithRawInput('no', note), false);
  t.end();
});

// quoted answers need to be exactly matched
test('Input evaluation with exact quoted answer', t => {
  let note = { answer: '"nonce"', };
  // let successResp = ['three??', 'Three', '3 maybe', 'trheee'];
  t.equal(evalNoteWithRawInput('nonce', note), true);
  t.equal(evalNoteWithRawInput('non', note), false);
  t.equal(evalNoteWithRawInput('nonc', note), false);
  t.equal(evalNoteWithRawInput('nocne', note), false);
  t.equal(evalNoteWithRawInput('nonces', note), false);
  note = { answer: '"nonce" || "jelly"', };
  t.equal(evalNoteWithRawInput('nonce', note), true);
  t.equal(evalNoteWithRawInput('nonc', note), false);
  t.equal(evalNoteWithRawInput('jelly', note), true);
  t.equal(evalNoteWithRawInput('jely', note), false);
  t.equal(evalNoteWithRawInput('jel', note), false);
  t.equal(evalNoteWithRawInput('je', note), false);
  t.end();
});
