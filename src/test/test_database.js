import mongoose from 'mongoose';
import fixture from './test_fixture';
import { NoteRecord,
         Category,
         StudentSession,
         User,
         ObjectID } from '../db/collection';
import Promise from "bluebird";
Promise.promisifyAll(mongoose);

var TestDatabase = function() {
  this.loaded = null;
}

TestDatabase.prototype.createObjectID = idString => ObjectID(idString)

TestDatabase.prototype.initialize = function() {
  return new Promise((resolve, reject) => {
    if(!this.loaded) {
      var connection = mongoose.connect('mongodb://127.0.0.1:3001/test').connection;
      connection.on('error', () => reject("Could not connect to test database") );
      connection.on('open', () => {
          this.loaded = true;
          resolve();
      });
    }
    else {
      resolve();
    }
  });
}

TestDatabase.prototype.setup = function() {
  return this.initialize();
}

TestDatabase.prototype.clean = function() {
  if(!this.loaded) {
    return Promise.reject(new Error("DB not loaded"));
  }

  return User.remove({}).then(() => {
    return StudentSession.remove({}).then(() => {
    }).then(() => {
      return Category.remove({}).then(() => {
      });
    }).then(() => {
      return NoteRecord.remove({}).then(() => {
      });
    });
  });
}

TestDatabase.prototype.close = function() {
  if(!this.loaded) {
    return Promise.reject(new Error("DB not loaded"));
  }
  return mongoose.connection.close();
}

TestDatabase.prototype.teardown = function() {
  if(!this.loaded) {
    return Promise.reject(new Error("DB not loaded"));
  }

  return this.clean();

}

TestDatabase.prototype.loadAllFixtures = () => fixture.addAll()

TestDatabase.prototype.loadUserFixtures = function() {
  if(!this.loaded) {
    return Promise.reject(new Error("DB not loaded"));
  }

  return fixture.addUsers();

}

TestDatabase.prototype.getStaticIDs = () => fixture.getStaticIDs()

TestDatabase.prototype.getTestUser = () => User.findOne()

export default TestDatabase;
