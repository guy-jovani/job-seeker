
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const positionSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    requirements: [{
      years: { type: Number, required: false },
      skill: { type: String, required: false },
    }],
    companyId: {
      type: Schema.Types.ObjectId, 
      ref: 'Company',
      required: true
    },
  }
);

module.exports = mongoose.model('Position', positionSchema);
