const mongoose = require('mongoose');
const errorHandling = require('../utils/errorHandling')
const Employee = require('../models/employee');
const Company = require('../models/company');
const Message = require('../models/message');
const Conversation = require('../models/conversation');
const validation = require('../utils/validation');



exports.postMessage = async (req, res, next) => {
  try {
    if(validation.handleValidationRoutesErrors(req, res)) return;
    if(!req.body.privateMsg){
      createUpdateConversation(req.body.recipients, req.body.message, req.body.senderId, req.body.senderType);
    } else {
      for(recipient of req.body.recipients) {
        createUpdateConversation([recipient], req.body.message, req.body.senderId, req.body.senderType);
      }
    }
    // const con = await Conversation.find().populate('participants');
    // console.log(con)
    res.status(200).json({
      type: 'success'
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, 'There was an error sending the message. Please try again later.'));
  }
};



const addMessageToConversation = async (conversation, content, senderId, senderType) => {
  const message = await Message.create({
    conversation: conversation._id, 
    creator: senderId,
    content: content, 
    onModel: senderType
  });
  await Conversation.updateOne({ _id: conversation._id }, {
    $push: { messages: message }});
};


const createUpdateConversation = async (recipients, content, senderId, senderType) => {
  const participants = recipients.map(recipient => {
    return { user: mongoose.Types.ObjectId(recipient._id), type: recipient.type };
  });
  participants.push({ user: mongoose.Types.ObjectId(senderId), type: senderType });

  const participantsIds = participants.map(part => part.user);

  // 1. check if conversation exists
  let conversation = await checkIfConExists(participantsIds);

  // 2. if exists - just update with new message
  if (conversation.length) {
    conversation = conversation[0]; // only one conversation should be found
  } else { // 3. doesn't exists - create conversation
    conversation = await Conversation.create({participants: participants, onModel: senderType});
  }
  await addMessageToConversation(conversation, content, senderId, senderType);
};


const checkIfConExists = async participantsIds => {
  return await Conversation.aggregate([
    {
      $match: {
        'participants.user' : {
          $all: participantsIds
        }
      }
    },
  ]);
};











// const addMessageToConversation = async (conversation, content, senderId, senderType) => {
//   const message = await Message.create({
//     conversation: conversation._id, 
//     creator: senderId,
//     content: content, 
//     onModel: senderType
//   });
//   // conversation = conversation.toObject();
//   conversation.messages.push(message);
//   await conversation.save();
// };

// const createUpdatePrivateConversations = async (recipients, content, senderId, senderType) => {
//   for(_id of recipients) {
//     const participants = [mongoose.Types.ObjectId(senderId)];
//     participants.push(mongoose.Types.ObjectId(_id));
//     // 1. check if conversation exists
//     let conversation = await Conversation.findOne({participants: participants});
//     // 2. if exists - just update with new message
//     if (conversation) {
//       await addMessageToConversation(conversation, content, senderId, senderType);
//     } else { // 3. doesn't exists - create conversation
//       conversation = await Conversation.create({participants: participants, onModel: senderType});
//       await addMessageToConversation(conversation, content, senderId, senderType);
//     }
//   };
// };