
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
      requirement: { type: String, required: true },
    }],
    company: {
      type: Schema.Types.ObjectId, 
      ref: 'Company',
      required: true
    },
    date: {
      type: Date,
      required: true
    }
  }
);

module.exports = mongoose.model('Position', positionSchema);
