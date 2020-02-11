
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employeeSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      required: false
    },
    lastName: {
      type: String,
      required: false
    },
    resetPassToken: String,
    resetPassTokenExpiration: Date,
  }
);

module.exports = mongoose.model('Employee', employeeSchema);
