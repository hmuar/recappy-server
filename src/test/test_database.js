import mongoose from 'mongoose';
import Promise from 'bluebird';
import {
  NoteRecord,
  Category,
  StudentSession,
  User,
  StudentModel,
  ObjectID
} from '~/db/collection';
import fixture from './test_fixture';

Promise.promisifyAll(mongoose);

export default class TestDatabase {
  constructor() {
    this.loaded = false;
  }

  createObjectID(idString) {
    return ObjectID(idString);
  }

  initialize() {
    return new Promise((resolve, reject) => {
      if (!this.loaded) {
        const connection = mongoose.connect('mongodb://127.0.0.1:3001/test').connection;
        connection.on('error', () => reject('Could not connect to test database'));
        connection.on('open', () => {
          this.loaded = true;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  setup() {
    return this.initialize();
  }

  clean() {
    if (!this.loaded) {
      return Promise.reject(new Error('DB not loaded'));
    }

    return User.remove({}).then(() =>
      StudentSession.remove({})
        .then(() => {})
        .then(() => Category.remove({}))
        .then(() => NoteRecord.remove({}))
        .then(() => StudentModel.remove({})));
  }

  close() {
    if (!this.loaded) {
      return Promise.reject(new Error('DB not loaded'));
    }
    return mongoose.connection.close();
  }

  teardown() {
    if (!this.loaded) {
      return Promise.reject(new Error('DB not loaded'));
    }

    return this.clean();
  }

  loadAllFixtures() {
    return fixture.addAll();
  }

  loadUserFixtures() {
    if (!this.loaded) {
      return Promise.reject(new Error('DB not loaded'));
    }

    return fixture.addUsers();
  }

  loadStudentModelFixtures() {
    return fixture.addStudentModel();
  }

  getStaticIDs() {
    return fixture.getStaticIDs();
  }

  getTestUser() {
    return User.findOne(ObjectID('5716893a8c8aff3221812148'));
  }
}
