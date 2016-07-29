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

TestDatabase.prototype.createObjectID = function(idString) {
  return Schema.ObjectID(idString);
}

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
  if(this.loaded) {
    return Schema.User.remove({}).then(() => {
      console.log("User collection cleaned");
    });
  }
  else {
    return Promise.resolve();
  }
}

TestDatabase.prototype.close = function() {
  if(this.loaded){
    mongoose.connection.close();
  }
}

TestDatabase.prototype.teardown = function() {
  console.log("trying to teardown...");
  return this.clean();
}

TestDatabase.prototype.loadAllFixtures = function() {

}

TestDatabase.prototype.loadUserFixtures = function() {
  return fixture.addUsers(this.db);
}


module.exports = TestDatabase;
