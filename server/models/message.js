const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId, 
      required: true,
      ref: 'Conversation'
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
      required: false
    },
    filePath: {
      type: String,
      required: false
    },
    fileName: {
      type: String,
      required: false
    },
    fileNumBytes: {
      type: Number,
      required: false
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('Message', messageSchema);