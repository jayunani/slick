const express = require('express');
const app = express();
const server = app.listen(3000);
const io = require('socket.io')(server);
const songsController = require('./controllers/songsController');
const cors = require('cors');


app.use(cors());

//setting up path directory and going up one level
app.use(express.static(__dirname + '/..'));

//sending the html file
app.get('/', (req, res) => {
  res.sendFile('index.html');
});

// client logic will request this API once index.html loads
// to retrieve stock song queue to generate list of songs
// to render on page
app.get('/songQueue', songsController.getSongsData, (req, res) => {
  res.json(req.data);
});

io.on('connection', socket => {

  var userCount = Object.keys(io.sockets.sockets).length;
  var userLeft = userCount - 1;
  io.emit('userCount', userCount);

  console.log('new client connected');
  socket.on('playSong', (songUrl) => {
    //console.log('received songUrl: ', songUrl)
    io.emit('playSong', songUrl);
  });
  socket.on('updateQueue', (songObj) => io.emit('updateQueue', songObj));

  // add playCurrent event handler
  socket.on('playCurrent', () => io.emit('playCurrent'));

  // add pauseCurrent event handler
  socket.on('pauseCurrent', () => io.emit('pauseCurrent'));

  console.log('sockets', Object.keys(io.sockets.sockets).length);
  socket.on('songEnded', (songUrl) => {
    console.log('song has ended!')
    io.emit('songEnded', songUrl);
  });

  socket.on('disconnect', function () {
    io.emit('user disconnected', userLeft);
  });

});

//---------------------------------------------------------------------------new addition


module.exports = app;
