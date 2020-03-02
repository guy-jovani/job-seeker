const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId, 
      required: true,
      refPath: 'Conversation'
    },
    creator: {
      type: Schema.Types.ObjectId, 
      required: true,
      refPath: 'onModel'
    },
    onModel: {
      type: String,
      required: true,
      enum: ['Employee', 'Company']
    },
    content: {
      type: String,
      required: true
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('Message', messageSchema);