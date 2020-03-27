const mongoose = require('mongoose');
const errorHandling = require('../utils/errorHandling');
const Message = require('../models/message');
const Conversation = require('../models/conversation');



exports.postMessage = async (privateMsg, recipients, content, senderId, senderType) => {
  try {
    let error = new Error();
    error.messages = [];
    if(!content || content.trim() === '') {
      error.messages.push('You can\'t send an empty message.');
    }
    if(!recipients || !recipients.length){
      error.messages.push('You need to choose who to send the message to.');
    }
    
    if(error.messages.length) {
      throw error;
    }
    let conversations = [];
    if(!privateMsg){
      conversations.push(await createUpdateConversation(recipients, content, senderId, senderType));
    } else {
      for(recipient of recipients) {
        conversations.push(await createUpdateConversation([recipient], content, senderId, senderType));
      }
    }
    return conversations;
  } catch (error) {
    throw errorHandling.handleServerErrors(error, 500, 'There was an error sending the message. Please try again later.');
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
  return {creator: message.creator, content: message.content, createdAt: message.createdAt};
};


const createUpdateConversation = async (recipients, content, senderId, senderType) => {
  const participants = recipients.map(recipient => {
    return { user: mongoose.Types.ObjectId(recipient._id), type: recipient.type };
  });
  participants.push({ user: mongoose.Types.ObjectId(senderId), type: senderType });

  const participantsIds = participants.map(part => part.user);

  // 1. check if conversation exists
  let conversation = await checkIfConExists(participantsIds);
  let newCon = true;
  if (conversation.length) { // 2. if exists - just update with new message
    conversation = conversation[0]; // only one conversation should be found
    newCon = false;
  } else { // 3. doesn't exists - create conversation
    conversation = await Conversation.create({participants: participants, onModel: senderType});
  }
  const message = await addMessageToConversation(conversation, content, senderId, senderType);
  conversation = await populateConversationParticipants(conversation);
  return [message, conversation, newCon];
};


const checkIfConExists = async participantsIds => {
  // console.log(participantsIds)
  return await Conversation.aggregate([
    {
      $match: {
        'participants.user' : {
          $all: participantsIds
        },
        'participants' : {
          $size: participantsIds.length
        }
      },
    },
  ]);
};


exports.fetchConversations = async (req, res, next) => {
  try {
    let conversations = await Conversation.aggregate([
      {
        $match: {
          'participants.user' : {
            $in: [mongoose.Types.ObjectId(req.query._id)]
          }
        }
      }
    ]);
    conversations = await populateConversationParticipants(conversations);
    conversations = await populateConversationMessages(conversations);
    res.status(200).json({
      type: 'success',
      conversations
    });
  } catch (error) {
    next(errorHandling.handleServerErrors(error, 500, 'There was an error fetching the conversations. Please try again later.'));
  }
};

const populateConversationParticipants = async conversations => {
  return await Conversation.populate(conversations, 
    {
      path: 'participants.user',
      select: [ 'name', 'firstName', 'lastName' ]
    });
};

const populateConversationMessages = async conversations => {
  return await Conversation.populate(conversations, 
    {
      path: 'messages',
      select: ['creator', 'content', 'createdAt']
    });
};

