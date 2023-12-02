const express = require('express');
const app = express();
const cors = require('cors');



const bodyParser= require('body-parser');
const db = require('./config/connection');

const server = require('http').createServer(app);
const indexRouter = require('./routes/index');

const io = require('socket.io')(server,{
    cors: {
        origin: ['http://localhost:4200','ws://localhost:4200','http://192.168.1.15:4200','https://video-call-angular-eight.vercel.ap','*'],
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true // if needed
    }
});
const PORT = 4000;
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
debug: true,
});
app.use('/peerjs', peerServer);

db.connect((data,err)=>{
    if(err) console.log(err);
    else console.log('db connection succuss');
});


app.use(cors({
    origin: ['http://localhost:4200','http://192.168.1.15:4200','https://video-call-angular-eight.vercel.app','*'], // Allow requests from this origin
    methods: ['GET', 'POST','PUT','PATCH','DELETE'], // Specify allowed HTTP methods,
}));

app.use(bodyParser.json({limit:"30mb",extended:true}));
app.use(bodyParser.urlencoded( {limit:'30mb',extended:true}));

io.on('connection', (socket) => {
    socket.on("join-room", (roomId, userId, userName) => {
        socket.join(roomId);
        setTimeout(()=>{
            io.to(roomId).emit('user-connected', userId);
        }, 1000)
        socket.on("message", (message) => {
          io.to(roomId).emit("createMessage", message, userName);
        });
    });
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
app.use('/',indexRouter)

server.listen(PORT,() => console.log(`server is listening on ${PORT}`));