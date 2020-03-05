const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationSchema = new Schema(
  {
    messages: [{
      type: Schema.Types.ObjectId, 
      required: true,
      ref: 'Message'
    }],
    participants: [{
      user: {
        type: Schema.Types.ObjectId, 
        required: true,
        refPath: 'participants.type'
      },
      type: {
        type: String,
        required: true,
        enum: ['Employee', 'Company']
      }
    }]    
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('Conversation', conversationSchema);