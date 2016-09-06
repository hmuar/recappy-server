import mongoose from 'mongoose';
import Promise from 'bluebird';
import { ObjectID } from '../db/collection';

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
    return new Promise((resolve, reject) => {
      if (!this.loaded) {
        const connection =
          mongoose.connect('mongodb://127.0.0.1:3001/meteor').connection;
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
