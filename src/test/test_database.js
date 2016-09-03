import mongoose from 'mongoose';
import Promise from 'bluebird';
import fixture from './test_fixture';
import { NoteRecord,
         Category,
         StudentSession,
         User,
         ObjectID } from '../db/collection';

Promise.promisifyAll(mongoose);

export default class TestDatabase {
  constructor() {
    this.loaded = null;
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

    return User.remove({}).then(() => (
      StudentSession.remove({}).then(() => {
      })
      .then(() => (
        Category.remove({})
      ))
      .then(() => (
        NoteRecord.remove({})
      ))
    ));
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

  getStaticIDs() {
    return fixture.getStaticIDs();
  }
  getTestUser() {
    return User.findOne();
  }
}
