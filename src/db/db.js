import mongoose from 'mongoose';
import Promise from 'bluebird';
import { ObjectID } from '~/db/collection';

// const mongoose = Promise.promisifyAll(require('mongoose'));
Promise.promisifyAll(mongoose);

// function NotConnectedError() {
//   this.name = 'NotConnectedError';
//   this.message = 'Not connected to database instance.';
// }

export default class Database {
  constructor() {
    this.loaded = false;
  }

  createObjectID(idString) {
    return ObjectID(idString);
  }

  initialize() {
    const dbUser = process.env.DB_USER;
    const dbPass = process.env.DB_PASS;
    const dbUrl = process.env.DB_URL;
    const dbName = process.env.DB_NAME;

    if (!dbUser || !dbPass || !dbUrl || !dbName) {
      return Promise.reject(
        'No db user, password, url, or name found. Make sure the proper environment variables are setup.'
      );
    }

    return new Promise((resolve, reject) => {
      if (!this.loaded) {
        const connection = mongoose.connect(
          `mongodb://${dbUser}:${dbPass}@${dbUrl}/${dbName}`
        ).connection;
        connection.on('error', () => reject('Could not connect to database'));
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

  // getOneCat(errorCallback, successCallback) {
  //   if (!this.db) {
  //     throw new NotConnectedError();
  //   }
  //   this.db.collection('category').findOne((err, result) => {
  //     if (err) {
  //       errorCallback(err);
  //     } else {
  //       successCallback(result);
  //     }
  //   });
  // }
}
