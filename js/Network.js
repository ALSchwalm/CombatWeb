
Network = {};
Network.latency = 0;

Network.setup = function() {
	Network.socket = io.connect('192.168.1.7');
	
	Network.socket.on('currentState', function (data) {
		Game.updateState(data);
	});

	/*
		The socket has likely not been connected at the time the player is made,
		so it will have no id. Set the ID here.
	*/
	Network.socket.on('connected', function (data) {
		Game.player.ID = Network.socket.socket.sessionid;
		Network.ID = Network.socket.socket.sessionid;
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