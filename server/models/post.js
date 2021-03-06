
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const likesSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId, 
      refPath: 'likes.onModel',
      required: true
    },
    onModel: {
      type: String,
      required: true,
      enum: ['Employee', 'Company']
    },
  },
  { timestamps: true }
);

const commentSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId, 
      refPath: 'comments.onModel',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    onModel: {
      type: String,
      required: true,
      enum: ['Employee', 'Company']
    }
  },
  { timestamps: true }
);


const postSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId, 
      refPath: 'onModel',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    onModel: {
      type: String,
      required: true,
      enum: ['Employee', 'Company']
    },
    allowComments: {
      type: Boolean,
      default: true
    },
    comments: [commentSchema],
    likes: [likesSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
