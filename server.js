const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

let users = {};
let colorSet = [];
let coordinateSet = [];

app.get('/', function(req, res) {
  res.render('client.ejs');
});

io.on('connection', function(socket) {
  socket.emit('sendClientSocketId', socket.id);

  socket.on('createUser', () => {
    const id = socket.id;
    const coordinate = getRandomCoordinate();
    const color = getRandomColor();
    users[id] = {
      top: coordinate[0],
      left: coordinate[1],
      id: socket.id,
      color,
      message: '@'
    };
    io.emit('render', users);
  });

  socket.on('updatePosition', parameter => {
    const { id, top, left } = parameter;
    users[id].top =
      users[id].top + top < 0
        ? 0
        : users[id].top + top > 95
        ? 95
        : users[id].top + top;
    users[id].left =
      users[id].left + left < 0
        ? 0
        : users[id].left + left > 95
        ? 95
        : users[id].left + left;
    users[id].left + left;
    io.emit('render', users);
  });

  socket.on('sendMessage', parameter => {
    const { id, message } = parameter;
    users[id].message = message;
    io.emit('render', users);
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('render', users);
  });
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  while (colorSet.includes(color)) {
    color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
  }
  colorSet.push(color);
  return color;
};

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

const getRandomCoordinate = () => {
  let x = getRandomInt(96);
  let y = getRandomInt(96);
  while (coordinateSet.includes(x, y)) {
    x = getRandomInt(96);
    y = getRandomInt(96);
  }
  coordinateSet.push([x, y]);
  return [x, y];
};
