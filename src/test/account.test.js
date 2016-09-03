import test from 'blue-tape';
import TestDatabase from './test_database';
import Account from '../account/account';

const before = test;
const after = test;
const db = new TestDatabase();

before('before account testing',
  () => db.setup().then(() => db.clean()).then(() => db.loadUserFixtures()));

test('Get user using FacebookID', t => {
  const fbID = '1028279607252619';
  return Account.getUserByFacebookMsgID(fbID).then(result => {
    t.ok(result);
    t.equal(result._id.toString(), '6716893a8c8aff3221812148');
  });
});

test('Get FacebookID with user', t => {
  const userID = db.createObjectID('6716893a8c8aff3221812148');
  return Account.getFacebookMsgID(userID).then(fbID => {
    t.equal(fbID, '1028279607252619');
  });
});

test('Create new user with FacebookID', t => {
  const fbID = '1028279607252619';
  return Account.createUserWithFacebookMsgID(fbID).then(user => {
    t.ok(user);
    t.equal(user.facebookMessageID, fbID);
  });
});

after('after account testing', () => db.close());
