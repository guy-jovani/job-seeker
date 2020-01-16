
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companySchema = new Schema(
  {
    email: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
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
    imagePath: {
      type: String,
      required: false
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
