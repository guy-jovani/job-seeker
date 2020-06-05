
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companySchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true,
      unique: true
    },
    website: {
      type: String,
      required: false
    },
    password: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: false
    },
    profileImagePath: {
      type: String,
      required: false
    },
    imagesPath: [{
      type: String,
      required: false
    }],
    jobs: [{
      type: Schema.Types.ObjectId, 
      ref: 'Job',
      require: false
    }],
    applicants: [{
      jobs: [{
        job: {
          type: Schema.Types.ObjectId, 
          ref: 'Job',
          require: false
        },
        status: {
          type: String,
          required: true,
          enum: ['applied', 'rejected', 'accepted']
        },
        date: { 
          type: Date,
          required: true
        }
      }],
      employee: {
        type: Schema.Types.ObjectId, 
        ref: 'Employee',
        required: true
      },
    }],
    resetPassToken: {
      type: String,
      required: false
    },
    resetPassTokenExpiration: {
      type: Date,
      required: false
    },
    refreshToken: {
      type: String,
      required: false
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);

