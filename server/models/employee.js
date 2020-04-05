
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
    profileImagePath: {
      type: String,
      required: false
    },
    jobs: [{
      job: {
        type: Schema.Types.ObjectId, 
        ref: 'Job',
        require: false
      },
      status: {
        type: String,
        required: true,
        enum: ['saved', 'applied', 'rejected', 'accepted']
      },
      date: { 
        type: Date,
        required: true
       }
    }],
    resetPassToken: String,
    resetPassTokenExpiration: Date,
  }
);

module.exports = mongoose.model('Employee', employeeSchema);
