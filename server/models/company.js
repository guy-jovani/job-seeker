
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companySchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    website: {
      type: String,
      required: false
    },
    description: {
      type: String,
      required: false
    },
    imagePath: {
      type: String,
      required: false
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
