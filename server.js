
var connect = require('connect');
var CANNON = require('./js/cannon.js');
var player = require('./js/PlayerServer.js');
require('./js/GameServer.js');


Game.setupPhysics();

var server = connect.createServer(
    connect.static(__dirname)
).listen(80);

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
	socket.on('disconnect', function () {
		io.sockets.emit('playerDisconnect', socket.id);
	});
	
	socket.on('stateUpdate', function (data) {
		updateState(socket, data);
	});
	
	socket.on('keyUp', function(event) {
		Game.players[socket.id].controls.onKeyUp(event);
	});
		
	socket.on('keyDown', function(event) {
		Game.players[socket.id].controls.onKeyDown(event);
	});
	
	
	Game.players[socket.id] = new player.Player(socket.id);
	socket.emit("connected"); //send server time to the player
});

function updateState(socket, data) {
	//gameState[socket.id] = data;
}


setInterval( function() {
	io.sockets.emit('currentState', Game.getState())
}, 40);

setInterval( function() {
	Game.world.step(1/60);
}, 1000/60);