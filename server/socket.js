
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
  console.log(socketUserId)
  socket.on('login', data => {
    console.log('login', data)

    socketUserId = data._id;
    socket.join(socketUserId);
  });

  socket.on('postAMsg', async data => {
    // console.log(data)
    try {
      const conversations = await chatController.postMessage(
        data.privateMsg, data.recipients, data.content, data.senderId, data.senderType
        )
        conversations.forEach(con => {
          const [message, conversation, newCon] = con;
          Reflect.deleteProperty(conversation, 'messages');
          // console.log(conversation.participants)
          conversation.participants.forEach(participant => {
            console.log(newCon, participant)
            console.log(socketUserId, participant.user._id, socketUserId === participant.user._id.toString(), typeof(socketUserId), typeof(participant.user._id.toString()))
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
          messages: error.messages,
          type: 'failure'
        });

        // res.status(error.statusCode || 500).json({ 
        //   // errors: [{
        //   //   msg: 'An unknown error occured'
        //   // }],
        //   messages: error.messages,
        //   type: 'failure'
        // });
      }
  });

};









