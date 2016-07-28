// const mongojs = require('mongojs');
// const pmongo = require('promised-mongo');
const mongoose = require('mongoose');
const fixture = require('./test_fixture');
const Schema = require('../db/schema');

var Promise = require("bluebird");
Promise.promisifyAll(mongoose);

var TestDatabase = function() {
  this.loaded = null;
  this.db = null;
}

TestDatabase.prototype.initialize = function() {
  // if(!this.loaded) {
  //   // this.db = mongojs('mongodb://127.0.0.1:3001/test', ['category',
  //   //                                                           'user',
  //   //                                                           'studentnote',
  //   //                                                           'studentsession',
  //   //                                                           'studentmodel']);
  //   var connection = mongoose.connect('mongodb://127.0.0.1:3001/test').connection;
  //   connection.on('error', console.error.bind(console, 'connection error:'));
  //   connection.on('open', () => {
  //       if(callback) callback();
  //       this.loaded = true;
  //       console.log("db loaded!");
  //   });
  // }
  // else {
  //   if(callback) callback();
  // }

    // this.db = mongojs('mongodb://127.0.0.1:3001/test', ['category',
    //                                                           'user',
    //                                                           'studentnote',
    //                                                           'studentsession',
    //                                                           'studentmodel']);
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
  if(this.db) {
    this.db.category.remove({});
    this.db.user.remove({});
    this.db.studentnote.remove({});
    this.db.studentsession.remove({});
    this.db.studentmodel.remove({});
  }
}

TestDatabase.prototype.close = function() {
  console.log("close():" + this.loaded);
  if(this.loaded){
    // this.db.close();
    mongoose.connection.close();
  }
}

TestDatabase.prototype.teardown = function() {
  // this.clean();
  console.log("trying to teardown...");
  return Schema.User.remove({}).then(() => {
    console.log("done removing user collection");
  });

}

TestDatabase.prototype.loadAllFixtures = function() {

}

TestDatabase.prototype.loadUserFixtures = function() {
  return fixture.addUsers(this.db);
}


module.exports = TestDatabase;
