
var connect = require('connect');

var server = connect.createServer(
    connect.static(__dirname)
).listen(80);

var io = require('socket.io').listen(server);

var gameState = {};

io.sockets.on('connection', function (socket) {
	socket.on('disconnect', function () {
		delete gameState[socket.id];
	});
	
	socket.on('stateUpdate', function (data) {
		updateState(socket, data);
	});
	
	socket.emit("connected");
	//console.log(socket.id)

});

function updateState(socket, data) {
	gameState[socket.id] = data;
}

setInterval( function() {
	io.sockets.emit('currentState', gameState)
	//console.log(gameState);
}, 10);