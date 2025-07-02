const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true
  },
  EmailID: {
    type: String,
    required: true,
    unique: true
  },
  Password: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('user', UserSchema);
