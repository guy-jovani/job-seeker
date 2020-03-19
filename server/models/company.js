
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
    imagesPath: [{
      type: String,
      required: false
    }],
    positions: [{
      type: Schema.Types.ObjectId, 
      ref: 'Position',
      require: false
    }],
    applicants: [{
      positions: [{
        position: {
          type: Schema.Types.ObjectId, 
          ref: 'Position',
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
    resetPassToken: String,
    resetPassTokenExpiration: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
