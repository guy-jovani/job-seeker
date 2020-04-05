


const chatController = require('./controllers/chat');
const changeStatusOfAUserJob = require('./utils/shared').changeStatusOfAUserJob;

let io, hostName;

const socketInitializer = {
  init : httpServer => {
    io = require('socket.io')(httpServer);
    return io;
  },
  getIO: () => {
    if(!io){
      throw new Error('Socket.io not initialized');
    }
    return io;
  },
  getHostName: () => {
    if(!hostName){
      throw new Error('Socket.io not initialized');
    }
    return hostName;
  }
};

exports.socketInitializer = socketInitializer;


exports.socketHandler = (socket) => {
  io = socketInitializer.getIO();
  hostName = socket.handshake.headers.host;
  socket.on('login', data => {
    console.log('login', data._id)
    socket.join(data._id);
  });

  socket.on('postAMsg', postAMsg);
  socket.on('updateStatus', updateStatus);

};




const postAMsg = async data => {
  try {
    const buffer = data.file ? Buffer.from(data.file) : null;
    const conversations = await chatController.postMessage(
      data.privateMsg, data.recipients, data.content, data.senderId, data.senderType, buffer, data.fileName, data.fileNumBytes);
      conversations.forEach(con => {
        const [message, conversation, newCon] = con;
        Reflect.deleteProperty(conversation, 'messages');
        conversation.participants.forEach(participant => {
          if (data.ownerId === participant.user._id.toString() && !newCon && !message.filePath && !data.newMessage) return;
          io.to(participant.user._id).emit('posted', { 
            message, conversation, type: 'success'
          } );
        });
      });
  } catch (error) {
    console.log(error);
    io.to(data.ownerId).emit('posted', { // sending the error to the sender of the message
      messages: error.messages || ['There was a problem sending the message, please refresh your page and try again'],
      type: 'failure'
    });
  }
}

const updateStatus = async data => {
  try {
    if(!data.employeeId || !data.companyId || !data.jobId || !data.ownerId ||
      (!['applied', 'saved', 'rejected', 'accepted'].includes(data.status)) ||
      (!['employee', 'company'].includes(data.kind))){
        throw new Error('There was an error updating the status of the wanted job.');
    } 
    const [employee, company] = await changeStatusOfAUserJob(data.companyId, 
                          data.employeeId, data.jobId, data.status);
    io.to(data.employeeId).emit('updatedStatus', { 
      type: 'success',
      kind: 'employee',
      user: employee
    });
    
    io.to(data.companyId).emit('updatedStatus', { 
      type: 'success',
      kind: 'company',
      user: company
    });
  } catch (error) {
    console.log(error);
    io.to(data.ownerId).emit('updatedStatus', { 
      messages: error.messages || ['There was an error updating the status of the wanted job.'],
      type: 'failure'
    });
  }
}




