
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
		console.log("keyUp");
	});
		
	socket.on('keyDown', function(event) {
		Game.players[socket.id].controls.onKeyDown(event);
		console.log("keyDown");
	});
	
	
	Game.players[socket.id] = new player.Player(socket.id);
	Game.world.add(Game.players[socket.id].body);
	socket.emit("connected"); //send server time to the player
});

function updateState(socket, data) {
	//gameState[socket.id] = data;
}


setInterval( function() {
	io.sockets.emit('currentState', Game.getState())
}, 100);

var time = Date.now();
setInterval( function() {
	for(var player in Game.players) {
		Game.players[player].controls.update( Date.now() - time );
	}
	Game.world.step(1/60);
	time = Date.now();
}, 1000/60);