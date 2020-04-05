const mongoose = require('mongoose');
const errorHandling = require('../utils/errorHandling');
const Message = require('../models/message');
const Conversation = require('../models/conversation');
const getSocketFileUniqueName = require('../utils/shared').getSocketFileUniqueName;
const getSocketFileUrl = require('../utils/shared').getSocketFileUrl;
const saveSocketFilePath = require('../utils/shared').saveSocketFilePath;

const socketInitializer = require('../socket').socketInitializer;



/**
 * Posting a message to conversations.
 * 
 * In case of an error - moving the error handling to the express error handling middleware
 * with a error code of 500, and an error message
 * 
 * @param {boolean} privateMsg - true if a private conversation, false if a group one.
 * @param {Array.<_id: string, type: string>} recipients -
 *                  an array of the ids and type (Company | Employee) of the users in the conversation.
 * @param {string} content - the content of the message (if not a file).
 * @param {string} senderId - the id of the user that sent the message.
 * @param {string} senderType - the type (Company | Employee) of the user that sent the message.
 * @param {Buffer} bufferFile - in case of a file - the buffer of data.
 * @param {string} fileName - the file name.
 * @param {number} fileNumBytes - the size of the file in bytes.
 * @returns {Array} - an array with all of the conversations relevant to the new message,
 *                    populated with the names of the participants.
  */
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


/**
 * Creates a message and assign it to the corresponding conversation.
 * @param {object} conversation - a Conversation object.
 * @param {string} content - the content of the message (if not a file).
 * @param {string} senderId - the id of the user that sent the message.
 * @param {string} senderType - the type (Company | Employee) of the user that sent the message.
 * @param {Buffer} bufferFile - in case of a file - the buffer of data.
 * @param {string} fileName - the file name.
 * @param {number} fileNumBytes - the size of the file in bytes.
 * @returns { creator: string,
 *            content: string,
 *            createdAt: string,
 *            filePath: string,
 *            fileName: string,
 *            fileNumBytes: string } - the message creator id, message content, created time,
 *                                      path to the file (if exist), file name, file size in bytes
 */
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

  await Conversation.updateOne({ _id: conversation._id }, { $push: { messages: message }});
  return {
    creator: message.creator,
    content: message.content,
    createdAt: message.createdAt,
    filePath: message.filePath,
    fileName: message.fileName,
    fileNumBytes: message.fileNumBytes,
  };
};



/**
 * Gets the conversation based on a its participants.
 * @param {Array} participantsIds - an array if ids.
 * @returns {object} - a Conversation object.
  */
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


/**
 * Populate the participants of a conversation with the names of the users.
 * @param {Array} conversations - an array if conversations.
 * @returns {array} - an array of Conversation object.
 */
const populateConversationParticipants = async conversations => {
  return await Conversation.populate(conversations, 
    {
      path: 'participants.user',
      select: [ 'name', 'firstName', 'lastName', 'email' ]
    });
};


/**
 * Creates/Updates conversation based on the message and recipients.
 * @param {Array.<_id: string, type: string>} recipients -
 *                  an array of the ids and type (Company | Employee) of the users in the conversation.
 * @param {string} content - the content of the message (if not a file).
 * @param {string} senderId - the id of the user that sent the message.
 * @param {string} senderType - the type (Company | Employee) of the user that sent the message.
 * @param {Buffer} bufferFile - in case of a file - the buffer of data.
 * @param {string} fileName - the file name.
 * @param {number} fileNumBytes - the size of the file in bytes.
 * @returns { Array.<message: object, conversation: object, newCon: boolean> } -
 *        the message object, the conversation object, true if its a new conversation, false if not.
  */
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

/**
 * Populate the messages of a conversation.
 * @param {Array} conversations - an array if conversations.
 * @returns {array} - an array of Conversation object.
  */
const populateConversationMessages = async conversations => {
  return await Conversation.populate(conversations, 
    {
      path: 'messages',
      select: ['creator', 'content', 'createdAt', 'filePath', 'fileName', 'fileNumBytes']
    });
};

/**
 * Send the client an array of all the conversations he is in, populated with the messages info and
 *  the names of all the participants.
 * 
 * In case of an error - moving the error handling to the express error handling middleware
 * with a error code of 500, and an error message
 * @param {express request object} req - the req need to have query params: 
 *                                        {string} _id - the id of the user.
 * @param {express respond object} res
 */
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



