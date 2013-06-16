
var connect = require('connect');

var currentState = {players: {}}

var server = connect.createServer(
    connect.static(__dirname)
).listen(80);

var io = require('socket.io').listen(server);


io.configure('development', function(){
  io.set('transports', ['xhr-polling']);	//AppFog does not support websockets yet
  io.set('close timeout', 2);				//decrease disconnect timeout from 60s to 2s
});

io.sockets.on('connection', function (socket) {

	socket.on('disconnect', function () {
		io.sockets.emit('playerDisconnected', socket.id);
		delete currentState.players[socket.id];
	});
	
	socket.on('playerState', function (data) {
		updateState(socket, data);
	});
	
	socket.on('playerSpawn', function(data) {
		socket.broadcast.emit('playerSpawn', socket.id);		//notify other players of the spawn
	});
	
	socket.on('playerDied', function(data) {
		socket.broadcast.emit('playerDied', data);			//notify other players of the death
	});
	
	
	currentState.players[socket.id] = {
		position : {x: 0, y: 100, z: 0}
	};
	socket.emit("connected", {seed: "cats", state: currentState}); 	//send current seed to the player
	socket.broadcast.emit("playerConnected", socket.id);			//notify other players of the connection
});

function updateState(socket, data) {
	currentState.players[socket.id] = data;
}


setInterval( function() {
	io.sockets.emit('currentState', currentState)
}, 50);