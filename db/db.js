exports = module.exports = {};

var DBError = {}
DBError.NotConnectedError = function() {
  this.name = "NotConnectedError"
  this.message = "Not connected to database instance."
}

var Database = function() {
  this.db = null;
};

Database.prototype.connect = function(connection) {
  this.db = connection;
};

Database.prototype.getOneCat = function(errorCallback, successCallback) {
  if(!this.db) {
    throw new DBError.NotConnectedError();
    return;
  }
  this.db.collection('category').findOne(function(err, result) {
      if(err) {
        errorCallback(err);
      } else {
        successCallback(result);
      }
  });
}

// Export instance so that it will get cached when require(),
// so will act like a singleton across entire app.
module.exports = new Database();
