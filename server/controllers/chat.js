const mongoose = require('mongoose');
const errorHandling = require('../utils/errorHandling');
const Message = require('../models/message');
const Conversation = require('../models/conversation');
const getSocketFileUniqueName = require('../utils/shared').getSocketFileUniqueName;
const getSocketFileUrl = require('../utils/shared').getSocketFileUrl;
const saveSocketFilePath = require('../utils/shared').saveSocketFilePath;

const socketInitializer = require('../socket').socketInitializer;


exports.postMessage = async (privateMsg, recipients, content, senderId, senderType, bufferFile, fileName, fileNumBytes) => {
  try {
    let error = new Error();
    error.messages = [];
    if((!content || content.trim() === '') && !fileName) {
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
      conversations.push(await createUpdateConversation(recipients, content, senderId, senderType, bufferFile, fileName, fileNumBytes));
    } else {
      for(recipient of recipients) {
        conversations.push(await createUpdateConversation([recipient], content, senderId, senderType, bufferFile, fileName, fileNumBytes));
      }
    }
    return conversations;
  } catch (error) {
    throw errorHandling.handleServerErrors(error, 500, 'There was an error sending the message. Please try again later.');
  }
};



const addMessageToConversation = async (conversation, content, senderId, senderType, bufferFile, fileName, fileNumBytes) => {
  const message = await Message.create({
    conversation: conversation._id, 
    creator: senderId,
    onModel: senderType
  });

  if(bufferFile) {
    const uniqueName = getSocketFileUniqueName(fileName);
    saveSocketFilePath(bufferFile, uniqueName);
    message.filePath = 
        getSocketFileUrl(uniqueName, socketInitializer.getHostName());
    message.fileName = fileName;
    message.fileNumBytes = fileNumBytes;
  } else {
    message.content = content;
  }

  await message.save();

  await Conversation.updateOne({ _id: conversation._id }, {
    $push: { messages: message }});
  return {
    creator: message.creator,
    content: message.content,
    createdAt: message.createdAt,
    filePath: message.filePath,
    fileName: message.fileName,
    fileNumBytes: message.fileNumBytes,
  };
};

const getParticipantsCon = async participantsIds => {
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

const createUpdateConversation = async (recipients, content, senderId, senderType, bufferFile, fileName, fileNumBytes) => {
  const participants = recipients.map(recipient => {
    return { user: mongoose.Types.ObjectId(recipient._id), type: recipient.type };
  });
  participants.push({ user: mongoose.Types.ObjectId(senderId), type: senderType });

  const participantsIds = participants.map(part => part.user);

  // 1. check if conversation exists
  let conversation = await getParticipantsCon(participantsIds);
  let newCon = true;
  if (conversation.length) { // 2. if exists - just update with new message
    conversation = conversation[0]; // only one conversation should be found
    newCon = false;
  } else { // 3. doesn't exists - create conversation
    conversation = await Conversation.create({participants: participants, onModel: senderType});
  }
  const message = await addMessageToConversation(conversation, content, senderId, senderType, bufferFile, fileName, fileNumBytes);
  conversation = await populateConversationParticipants(conversation);
  return [message, conversation, newCon];
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
      select: ['creator', 'content', 'createdAt', 'filePath', 'fileName', 'fileNumBytes']
    });
};

