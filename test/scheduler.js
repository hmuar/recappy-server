'use strict';

const test = require('blue-tape');
const before = test;
const after = test;

const TestDatabase = require('./test_database');
const Scheduler = new (require('../core/schedule'));
const db = new TestDatabase();

before("before account testing", function(t) {
  return db.setup().then(() => db.clean()).then(() => db.loadUserFixtures());
});

// let HARDCODED_SUBJ_NAME = 'crash-course-biology';
// let subject = DBHelper.getCategoryByName('subject', HARDCODED_SUBJ_NAME);
// let testUser = User.findOne();
//
// describe('Note Scheduler', function() {
//   it('should schedule old notes based on due date', function() {
//     var nextNotes = Scheduler.getOldMaterial(subject, 20, testUser._id);
//     expect(nextNotes.length).toEqual(12);
//   });
//
//   it('should schedule new notes', function() {
//     var nextNotes = Scheduler.getNewMaterial(subject, 20, testUser._id, -1);
//     expect(nextNotes.length).toEqual(22);
//   });
//
//   // it('should schedule combined old and new notes', function() {
//   //   var nextNotes = Scheduler.getNextNotes(subject, 20, testUser._id);
//   //   expect(nextNotes.length).toEqual(20);
//   // });
//
// });


after("after account testing", function(t) {
  return db.close();
});
