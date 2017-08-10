/* eslint-disable max-len */
import test from 'blue-tape';
import pipeAddPaths from '~/controller/pipe_add_paths';
import { SessionState } from '~/core/session_state';
import DBAssist from '~/db/category_assistant';
import AdapterFB from '~/adapter/fbmessenger/fbmessenger';
import NotificationController from '~/notification/controller';
import TestDatabase from './test_database';
import TestConst from './test_const';

const before = test;
const after = test;
const db = new TestDatabase();

const SUBJECT_NAME = TestConst.SUBJECT_NAME;
let subject = null;
let testUser = null;

const controller = new NotificationController(AdapterFB);

before('before notifications testing', () =>
  db
    .setup()
    .then(() => db.clean())
    .then(() => db.loadAllFixtures())
    .then(() => DBAssist.getCategoryByName('subject', SUBJECT_NAME))
    .then(subj => {
      subject = subj;
      return db.getTestUser();
    })
    .then(user => {
      testUser = user;
    }));

test('test notification controller', t => {
  const sendInfo = {
    subjectID: subject._id,
    senderID: '1028279607252642',
    userID: testUser._id,
  };
  return controller.send(sendInfo).then(state => {
    t.ok(state);
  });
});

after('after notifications testing', () => db.close());
