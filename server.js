
var connect = require('connect');
var CANNON = require('./serverlibs/cannon.js');
require('./serverlibs/Game.js');

Game.setupPhysics();

var server = connect.createServer(
    connect.static(__dirname)
).listen(80);

var io = require('socket.io').listen(server);

var gameState = {times:{}};
var time = 0;

io.sockets.on('connection', function (socket) {
	socket.on('disconnect', function () {
		//delete gameState[socket.id];
	});
	
	socket.on('stateUpdate', function (data) {
		updateState(socket, data);
	});
	
	socket.emit("connected"); //send server time to the player
	gameState.times[socket.id] = 0;
});

function updateState(socket, data) {
	//gameState[socket.id] = data;
}


setInterval( function() {
	io.sockets.emit('currentState', gameState)
	for(var i in gameState.times) {
		gameState.times[i]++;
	}
}, 40);

setInterval( function() {
	Game.world.step(1/60);
}, 1000/60);