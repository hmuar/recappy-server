const mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  name: String,
  email: String,
  facebookMessageID: String
});
var User = mongoose.model('User', userSchema);

var Schema = {
  User: User
}

module.exports = Schema
