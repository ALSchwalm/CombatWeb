
Network = {};
Network.latency = 0;

Network.setup = function() {
	Network.socket = io.connect();

	Network.socket.on('currentState', function (data) {
		Game.receivedStateBuffer.push(data);
		Game.interpolate()
		//Game.updateState(data);
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
	});
	
	Network.socket.on('playerConnected', function(data) {
		Game.otherPlayers[data] = new Player(data);
		Game.scene.add(Game.otherPlayers[data].mesh);
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
