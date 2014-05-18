
var connect = require('connect');

var DEFAULT_TEAM_ONE = "One";
var DEFAULT_TEAM_TWO = "Two";

var currentState = {
    players: {},
    teams: [
        {name : DEFAULT_TEAM_ONE, players: []},
        {name : DEFAULT_TEAM_TWO, players: []}
    ]
}

var server = connect.createServer(
    connect.static(__dirname)
).listen(80);

var io = require('socket.io').listen(server);
io.set('log level', 1); // reduce logging

function createSeed()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var seed = createSeed();


io.configure('development', function(){
    io.set('close timeout', 2);  //decrease disconnect timeout from 60s to 2s
});

io.sockets.on('connection', function (socket) {

    socket.on('disconnect', function () {
	io.sockets.emit('playerDisconnected', socket.id);
        var index = currentState.players[socket.id].team.players.indexOf(socket.id);
        if (index > -1)
            currentState.players[socket.id].team.players.splice(index, 1);
	delete currentState.players[socket.id];
    });

	socket.on('playerState', function (data) {
		updateState(socket, data);
	});

	socket.on('playerSpawn', function() {
		socket.broadcast.emit('playerSpawn', socket.id);  //notify other players of this players spawn
	});

    socket.on('playerDied', function(data) {
	socket.broadcast.emit('playerDied', data); //notify other players of the death
        if (!data.source) {
            io.sockets.emit('message', {
                source:'server',
                message: data.reason,
                left: data.destination
            });
            currentState.players[data.destination].deaths++;
        } else {
	        io.sockets.emit('message', {
                source:'server',
                message:" fragged ",
                left:data.source,
                right:data.destination
            });
            currentState.players[data.source].kills++;
            currentState.players[data.destination].deaths++;
        }
    });

	socket.on('createFire', function(data) {
		socket.broadcast.emit('createFire', data);   //notify other players of the weapons fire
	});

	socket.on('message', function(data) {
		io.sockets.emit('message', data);
	});

    var playername = "Player"+Object.keys(currentState.players).length
    if (currentState.teams[0] > currentState.teams[1]) {
        var team = currentState.teams[1];
    } else {
        var team = currentState.teams[0];
    }
    team.players.push(socket.id);

    currentState.players[socket.id] = {
	position : {x: 0, y: 100, z: 0},
	name: playername,
        deaths: 0,
        kills: 0,
        team: team
    };
    socket.broadcast.emit("playerConnected", {id:socket.id, name:playername});			//notify other players of the connection

	socket.emit("connected", {seed: seed, name:playername, state:currentState}); 	//send current seed to the player
	io.sockets.emit('message', {source:'server', message:" joined the game", left:socket.id});
});

function updateState(socket, data) {
    for (var field in data) {
        currentState.players[socket.id][field] = data[field];
    }
}

setInterval( function() {
	io.sockets.emit('currentState', currentState)
}, 80);
