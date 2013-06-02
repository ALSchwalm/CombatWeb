
Network = {};

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
		Game.player.ID = Network.socket.socket.sessionid
	});
}