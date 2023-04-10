const http = require('http')
const fs = require('fs')
const socket = require('socket.io')

const hostname = '127.0.0.1'
const port = 3000

const server = http.createServer((req, res) => {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET')
  res.setHeader('Access-Control-Max-Age', 2592000)
  res.end(fs.readFileSync(`${__dirname}/index.html`))
})

const app = server.listen(port, hostname, () => {
})

const io = socket(app, {
  cors: {
    origin: '*'
  }
})

io.on("connection", function (socket) {
  console.log("User Connected :" + socket.id);

  //Triggered when a peer hits the join room button.

  socket.on("join", function (roomName) {
    let rooms = io.sockets.adapter.rooms;
    let room = rooms.get(roomName);

    //room == undefined when no such room exists.
    if (room == undefined) {
      socket.join(roomName);
      socket.emit("created");
    } else if (room.size == 1) {
      //room.size == 1 when one person is inside the room.
      socket.join(roomName);
      socket.emit("joined");
    } else {
      //when there are already two people inside the room.
      socket.emit("full");
    }
    console.log(rooms);
  });

  //Triggered when the person who joined the room is ready to communicate.
  socket.on("ready", function (roomName) {
    socket.broadcast.to(roomName).emit("ready"); //Informs the other peer in the room.
  });

  //Triggered when server gets an icecandidate from a peer in the room.

  socket.on("candidate", function (candidate, roomName) {
    console.log(candidate);
    socket.broadcast.to(roomName).emit("candidate", candidate); //Sends Candidate to the other peer in the room.
  });

  //Triggered when server gets an offer from a peer in the room.

  socket.on("offer", function (offer, roomName) {
    socket.broadcast.to(roomName).emit("offer", offer); //Sends Offer to the other peer in the room.
  });

  //Triggered when server gets an answer from a peer in the room.

  socket.on("answer", function (answer, roomName) {
    socket.broadcast.to(roomName).emit("answer", answer); //Sends Answer to the other peer in the room.
  });
});
