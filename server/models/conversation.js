const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationSchema = new Schema(
  {
    messages: [{
      type: Schema.Types.ObjectId, 
      required: true,
      refPath: 'Message'
    }],
    // participants: [{
    //   type: Schema.Types.ObjectId, 
    //   required: true,
    //   refPath: 'onModel'
    // }],
    // onModel: {
    //   type: String,
    //   required: true,
    //   enum: ['Employee', 'Company']
    // },
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