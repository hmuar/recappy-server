exports = module.exports = {};

function NotConnectedError() {
  this.name = 'NotConnectedError';
  this.message = 'Not connected to database instance.';
}

class Database {
  constructor() {
    this.db = null;
  }

  connect(connection) {
    this.db = connection;
  }

  getOneCat(errorCallback, successCallback) {
    if (!this.db) {
      throw new NotConnectedError();
    }
    this.db.collection('category').findOne((err, result) => {
      if (err) {
        errorCallback(err);
      } else {
        successCallback(result);
      }
    });
  }
}

// Export instance so that it will get cached when require(),
// so will act like a singleton across entire app.
export default new Database();
