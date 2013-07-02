
Sound = {};

Sound.setup = function() {
	var a = {};
    Sound.audio = a;

    a.context = new webkitAudioContext();
    a.convolver = a.context.createConvolver();
    a.volume = a.context.createGainNode();

    a.mixer = a.context.createGainNode();

    a.flatGain = a.context.createGainNode();
    a.convolverGain = a.context.createGainNode();

    a.destination = a.mixer;
    a.mixer.connect(a.flatGain);
    //a.mixer.connect(a.convolver);
    a.convolver.connect(a.convolverGain);
    a.flatGain.connect(a.volume);
    a.convolverGain.connect(a.volume);
    a.volume.connect(a.context.destination);

	
	Sound.backgroundMusic = Sound.loadSound("assets/angrymob.mp3");
}

Sound.start = function() {
    Sound.audio.volume.connect(Sound.audio.context.destination);
}


Sound.loadBuffer = function(soundFileName, callback) {
	var request = new XMLHttpRequest();
	request.open("GET", soundFileName, true);
	request.responseType = "arraybuffer";
	var ctx = Sound.audio.context;
	request.onload = function() {
		var buffer = ctx.createBuffer(request.response, false);
		callback(buffer);
	};
	request.send();
	return request;
}

Sound.loadSound = function(soundFileName) {
	var ctx = Sound.audio.context;

	var sound = {};
	sound.source = ctx.createBufferSource();
	sound.source.loop = true;
	sound.panner = ctx.createPanner();
	sound.volume = ctx.createGainNode();

	sound.source.connect(sound.volume);
	sound.volume.connect(sound.panner);
	sound.panner.connect(Sound.audio.destination);

	Sound.loadBuffer(soundFileName, function(buffer){
		sound.buffer = buffer;
		sound.source.buffer = sound.buffer;
		sound.source.noteOn(ctx.currentTime + 0.020);
	});

	return sound;
}

Sound.updateListenerPosition = function() {
	var projector = new THREE.Projector();
	var vector = new THREE.Vector3(0,0,0);
	var pos = projector.unprojectVector(vector, Game.camera);
	Sound.audio.context.listener.setPosition(pos.x, pos.y, pos.z);
}

Sound.setSourcePosition = function(object) {
	var pos = object.position;
	object.sound.panner.setPosition(pos.x, pos.y, pos.z);
}

