'use strict';

const test = require('blue-tape');
var Know = require('../core/knowledge');

var SRCore = require('../core/spaced_repetition');

test('Schedule Core Factor Calculation', function(t) {
	t.equal(SRCore.calcFactor(2, 0), 1.3);
	t.equal(SRCore.calcFactor(2, 1), 1.46);
	t.equal(SRCore.calcFactor(2, 2), 1.68);
	t.equal(SRCore.calcFactor(2, 3), 1.86);
	t.equal(SRCore.calcFactor(2, 4), 2);
	t.equal(SRCore.calcFactor(2, 5), 2.1);
	t.equal(SRCore.calcFactor(2.2, 8), SRCore.calcFactor(2.2, 5));
	t.equal(SRCore.calcFactor(2.2, -2), SRCore.calcFactor(2.2, 0));
  t.end();
});

test('should calculate correct interval', function(t) {
	t.equal(SRCore.calcInterval(2, 2, 0, 5), 0);
	t.equal(SRCore.calcInterval(2, 2.1, 1, 5), 1);
	t.equal(SRCore.calcInterval(2, 2.2, 2, 5), 2);
	t.equal(SRCore.calcInterval(2, 2.3, 3, 5), 4);
	t.equal(SRCore.calcInterval(2, 2.4, 4, 5), 4);
	t.equal(SRCore.calcInterval(2, 2.5, 5, 5), 5);
	t.equal(SRCore.calcInterval(2, 2.6, 6, 5), 5);
	t.equal(SRCore.calcInterval(2, 2.7, 7, 5), 5);
  t.end();
});

test('should calculate correct interval for initial count cases', function(t) {
	t.equal(SRCore.calcInterval(2, 2, 0, 5), SRCore.calcInterval(5, 3, 0));
	t.equal(SRCore.calcInterval(2, 2, 0, 5), SRCore.calcInterval(6, 2, 0));
	t.equal(SRCore.calcInterval(2, 2, 1, 5), SRCore.calcInterval(5, 3, 1));
	t.equal(SRCore.calcInterval(2, 2, 1, 5), SRCore.calcInterval(6, 2, 1));
	t.equal(SRCore.calcInterval(2, 2, 2, 5), SRCore.calcInterval(5, 3, 2));
	t.equal(SRCore.calcInterval(2, 2, 2, 5), SRCore.calcInterval(6, 2, 2));
  t.end();
});

test('should calculate interval for wrong response', function(t) {
  // _SRCore.calcInterval = function(prevInterval, factor, count, responseQuality)
  t.equal(SRCore.calcInterval(2, 2.1, 0, 0), SRCore.calcInterval(2, 2, 0, 0));
  // the rest interval calculations should be equal to calculating the interval
  // as if the count = 1. This is because when response quality is bad, system
  // should treat interval calc as if this were the first time user saw information
  t.equal(SRCore.calcInterval(2, 2.2, 1, 0), SRCore.calcInterval(2, 2.2, 1, 1));
  t.equal(SRCore.calcInterval(2, 2.3, 2, 0), SRCore.calcInterval(2, 2.3, 2, 1));
  t.equal(SRCore.calcInterval(2, 2.4, 3, 0), SRCore.calcInterval(2, 2.4, 3, 1));
  t.equal(SRCore.calcInterval(2, 2.5, 4, 0), SRCore.calcInterval(2, 2.5, 4, 1));
  t.equal(SRCore.calcInterval(2, 2.6, 5, 0), SRCore.calcInterval(2, 2.6, 5, 1));
  t.equal(SRCore.calcInterval(2, 2.7, 6, 0), SRCore.calcInterval(2, 2.7, 6, 1));
  t.end();
});

test('should not have weight less than 0', function(t) {
  t.ok(Know.calcWeight(0, 0.2, 3) > -0.001);
  t.end();
});

// test('should throw error for unknown action', function() {
// 	var errFunc = function() {
// 		DBAssistant.registerUserAction(
// 						'5716893a8c8aff3221812148',
// 						'9e16c772556579bd6fc6c222',
// 						'undefined-action',
//             {},
// 						);
// 	}
// 	t.equal(errFunc).toThrowError(Meteor.Error, 'Action not recognized: undefined-action [unknown-action]');
//   t.end();
// });
//
// test('should throw error for unknown user', function() {
// 	var errFunc = function() {
// 		DBAssistant.registerUserAction(
// 						'7716893a8c8aff3221812147',
// 						'9e16c772556579bd6fc6c222',
// 						'response',
//             {},
// 						);
// 	}
//
// 	t.equal(errFunc).toThrowError(Meteor.Error, 'No user found with ID: 7716893a8c8aff3221812147 [unknown-user]');
//   t.end();
// });
//
// test('should throw error for unknown note', function() {
// 	var errFunc = function() {
// 		DBAssistant.registerUserAction(
// 						'5716893a8c8aff3221812148',
// 						'7e16c772556579bd6fc6c227',
// 						'response',
//             {},
// 						);
// 	}
//
// 	t.equal(errFunc).toThrowError(Meteor.Error, 'No note found with ID: 7e16c772556579bd6fc6c227 [unknown-note]');
//   t.end();
// });
