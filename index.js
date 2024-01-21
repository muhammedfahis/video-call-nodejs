const express = require('express');
const app = express();
const cors = require('cors');



const bodyParser = require('body-parser');
const db = require('./config/connection');

const server = require('http').createServer(app);
const indexRouter = require('./routes/index');

const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // if needed
  }
});
const PORT = 4000;


db.connect((data, err) => {
  if (err) console.log(err);
  else console.log('db connection succuss');
});


app.use(cors());


app.use(bodyParser.json({
  limit: "30mb",
  extended: true
}));
app.use(bodyParser.urlencoded({
  limit: '30mb',
  extended: true
}));


let userConnections = [];

io.on('connection', (socket) => {
  socket.on('users_info_to_signaling_server', (data) => {
    let otherUsers = userConnections.filter(conn => conn.meeting_id === data.meeting_id);
    socket.join(data.meeting_id)
    // userConnections = userConnections.filter(conn => conn.user_id !== data.current_user_id);
    userConnections.push({
      connectionID: socket.id,
      user_id: data.current_user_id,
      user_name: data.current_user_name,
      meeting_id: data.meeting_id
    });
    otherUsers.forEach(user => {
      socket.to(user.connectionID).emit('other_users_to_inform', {
        other_user_id: data.current_user_id,
        other_user_name: data.current_user_name,
        connId: socket.id
      });
    });
    socket.emit('newConnectionInformation', otherUsers);
  })
  socket.on('sdpProcess', (data) => {
    socket.to(data.to_connid).emit('sdpProcess', {
      message: data.message,
      from_connid: socket.id
    })
  })
  socket.on('message',(data) => {
    io.to(data.room).emit('message',{
      from_user_id: data.from_user_id,
      from_user_name:data.from_user_name,
      message:data.message
    })
  })
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    userConnections =  userConnections.filter(conn => conn.connectionID !== socket.id);
    // Emit an event to inform other clients about the disconnection
    socket.emit('userDisconnected', { disconnectedUserId: socket.id });
  });
  socket.on('userLeaving', (data) => {
    console.log('User leaving:', data.user_id);
    userConnections =  userConnections.filter(conn => conn.connectionID !== socket.id);
    let otherUsers = userConnections.filter(conn => conn.meeting_id === data.meeting_id && data.user_id !== conn.user_id);
    otherUsers.forEach(user => {
      socket.to(user.connectionID).emit('userDisconnected', { disconnectedUserId: socket.id, user_id: data.user_id });
    });
  });

});
app.use('/', indexRouter)

server.listen(PORT, () => console.log(`server is listening on ${PORT}`));