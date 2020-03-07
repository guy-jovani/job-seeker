
const chatController = require('./controllers/chat');


let io;

socketInitializer = {
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
  const io = socketInitializer.getIO();
  let socketUserId; // private room to each connected user
  socket.on('login', data => {
    socketUserId = data._id;
    socket.join(socketUserId);
  });

  socket.on('postAMsg', async data => {
    try {
      console.log(data)
      const conversations = await chatController.postMessage(
        data.privateMsg, data.recipients, data.content, data.senderId, data.senderType
        )
        conversations.forEach(con => {
          const [message, conversation, newCon] = con;
          Reflect.deleteProperty(conversation, 'messages');
          conversation.participants.forEach(participant => {
            if (socketUserId === participant.user._id.toString() && newCon) return;
            io.to(participant.user._id).emit('posted', { 
              message, conversation, type: 'success'
            } );
          });
        });
      } catch (error) {
        console.log("******************************************");
        console.log("******************************************");
        console.log("an error cought and printed in socket.js");
        console.log(error);
        io.to(socketUserId).emit('posted', { // sending the error to the sender of the message
          messages: error.messages || ['There was a problem sending the message, please refresh your page and try again'],
          type: 'failure'
        });
      }
  });

};









