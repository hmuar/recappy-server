const mongojs = require('mongojs');
const fixture = require('./test_fixture');

var TestDatabase = function() {
  this.db = null;
}

TestDatabase.prototype.initialize = function() {
  if(!this.db) {
    this.db = mongojs('mongodb://127.0.0.1:3001/tape-test', ['category',
                                                              'user',
                                                              'studentnote',
                                                              'studentsession',
                                                              'studentmodel']);
  }
}

TestDatabase.prototype.setup = function() {
  this.initialize();
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
  if(this.db){
    this.db.close();
  }
}

TestDatabase.prototype.tearDown = function() {
  // this.clean();
  this.close();
}

TestDatabase.prototype.loadAllFixtures = function() {

}

TestDatabase.prototype.loadUserFixtures = function() {
  fixture.addUsers(this.db);
}


module.exports = TestDatabase;
