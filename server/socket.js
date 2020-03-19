
const chatController = require('./controllers/chat');
const changeStatusOfAUserPosition = require('./utils/shared').changeStatusOfAUserPosition;

let io;

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
  }
};

exports.socketInitializer = socketInitializer;


exports.socketHandler = (socket) => {
  io = socketInitializer.getIO();
  // let socketUserId; // private room to each connected user
  socket.on('login', data => {
    // socketUserId = data._id;
    console.log('login', data._id)
    socket.join(data._id);
  });

  socket.on('postAMsg', postAMsg);
  socket.on('updateStatus', updateStatus);

};


const postAMsg = async data => {
  try {
    const conversations = await chatController.postMessage(
      data.privateMsg, data.recipients, data.content, data.senderId, data.senderType);
      conversations.forEach(con => {
        const [message, conversation, newCon] = con;
        Reflect.deleteProperty(conversation, 'messages');
        conversation.participants.forEach(participant => {
          if (data.ownerId === participant.user._id.toString() && !newCon) return;
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
    if(!data.employeeId || !data.companyId || !data.positionId || !data.ownerId ||
      (!['applied', 'saved', 'rejected', 'accepted'].includes(data.status)) ||
      (!['employee', 'company'].includes(data.kind))){
        throw new Error('There was an error updating the status of the wanted position.');
    } 
    const [employee, company] = await changeStatusOfAUserPosition(data.companyId, 
                          data.employeeId, data.positionId, data.status);

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
      messages: error.messages || ['There was an error updating the status of the wanted position.'],
      type: 'failure'
    });
  }
}




