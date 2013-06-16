
Network = {};
Network.latency = 0;

Network.setup = function() {
	Network.socket = io.connect();

	Network.socket.on('currentState', function (data) {
		data.time = Date.now();
		Game.interpolate(data)
	});
	
	/*
		The socket has likely not been connected at the time the player is made,
		so it will have no id. Set the ID here.
	*/
	Network.socket.on('connected', function (data) {
		Game.player.ID = Network.socket.socket.sessionid;
		Network.ID = Network.socket.socket.sessionid;
		Game.seed = data.seed;
		Game.receivedStateBuffer.push(data.state);
		Game.seedWorld(Game.seed);
	});
	
	Network.socket.on('playerConnected', function(data) {
		console.log(data, "connected");
		Game.otherPlayers[data] = new Player(data);
	});
	
	Network.socket.on('playerSpawn', function(data) {
	console.log(data, "spawned");
		if (Game.otherPlayers[data])
			Game.scene.add(Game.otherPlayers[data].mesh);
	});
	
	Network.socket.on('playerDied', function(data) {
		console.log(data, "died");
		if (Game.otherPlayers[data])
			Game.scene.remove(Game.otherPlayers[data].mesh);
		else if (data == Game.player.ID) {
			Game.player.live = false;
			
			setTimeout( function() {
				Game.player.live = true;
				Game.player.body.position.set(Game.spawn.x, 
												Game.spawn.y, 
												Game.spawn.z)
				Network.socket.emit('playerSpawn', Game.player.ID);
			}, 3000);
		}
	});
	
	
	Network.socket.on('playerDisconnected', function(data) {
		console.log("received disconnect");
		if (Game.otherPlayers[data]) {
			Game.scene.remove(Game.otherPlayers[data].mesh);
			delete Game.otherPlayers[data];
		}
	});
	
}

Network.findLatency = function() {
	/*
		It seems this is the best we can do to measure latency in-browser. Obviously
		there are problems with this approach, it is really more a measurement of bw and
		does not account for the tcp handshake, etc.
	*/

	var ts, img = new Image;
	img.onload = function() { Network.latency=(+new Date - ts); };
	ts = +new Date;
	img.src = "/assets/1x1.GIF";
}
