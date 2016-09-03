exports = module.exports = {};

function NotConnectedError() {
  this.name = "NotConnectedError"
  this.message = "Not connected to database instance."
}

let Database = function() {
  this.db = null;
};

Database.prototype.connect = function(connection) {
  this.db = connection;
};

Database.prototype.getOneCat = function(errorCallback, successCallback) {
  if(!this.db) {
    throw new NotConnectedError();
    return;
  }
  this.db.collection('category').findOne((err, result) => {
      if(err) {
        errorCallback(err);
      } else {
        successCallback(result);
      }
  });
}

// Export instance so that it will get cached when require(),
// so will act like a singleton across entire app.
export default new Database();
