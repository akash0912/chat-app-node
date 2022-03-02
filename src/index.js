const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const hbs = require("hbs");
const Filter = require("bad-words");
const {
  generateMessages,
  generateLocationMessage,
} = require("./utils/message");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/user");
const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// const viewPath = path.join(__dirname,'../template/views')
const filePath = path.join(__dirname, "../public");
app.use(express.static(filePath));

// app.set('views', viewPath)
// app.set('view engine', 'hbs')
//to Ensure that node searches for css and script files

// hbs.registerHelper("raw", function (value) {
//   return value.fn();
// });

//this is going to run when new user is connected to server
io.on("connection", (socket) => {
  console.log("New webSocket connection");
  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);
    socket.emit("serverMessage", generateMessages("Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "serverMessage",
        generateMessages(`${username.charAt(0).toUpperCase() + username.slice(1)} has joined the chat`)
      );
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })
    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    if (user) {
      const filter = new Filter();
      if (filter.isProfane(message)) {
        return callback("Profanity is not allowed!");
      }
      io.to(user.room).emit("serverMessage", generateMessages(user.username,message));
      callback();
    }
  });

  socket.on("location", (coords, callback) => {
    const user = getUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "locationMessage",
        generateLocationMessage(user.username,
          `https://google.com/maps?q=${coords.lat},${coords.lng}`
        )
      );
      callback();
    }
  });
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "serverMessage",
        generateMessages(`${user.username} left the meeting!`)
      );
      
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});
// app.get('/',(req, res)=>{
//     res.render('index',{
//         title:"Chat App"
//     })
// })

// app.get('/chat',(req,res)=>{
//     res.render('chat')
// })

server.listen(port, () => {
  console.log("Server started on port " + port);
});
