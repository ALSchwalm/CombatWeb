
Sound = {};

Sound.setup = function() {
    var a = {};
    Sound.audio = a;

    a.context = new webkitAudioContext();
    a.volume = a.context.createGainNode();
    a.mixer = a.context.createGainNode();
    a.flatGain = a.context.createGainNode();

    a.destination = a.mixer;
    a.mixer.connect(a.flatGain);

    a.flatGain.connect(a.volume);
    a.volume.connect(a.context.destination);

    Sound.buffers = {};
    Sound.loadSound("laser", "assets/laser.wav");
    Sound.loadSound("recharge", "assets/recharge.wav");
    Sound.loadSound("death", "assets/death.wav");
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

Sound.loadSound = function(name, soundFileName) {
    Sound.loadBuffer(soundFileName, function(buffer){
        Sound.buffers[name] = buffer;
    });
}

Sound.updateListenerPosition = function() {
    var projector = new THREE.Projector();
    var vector = new THREE.Vector3(0,0,0);
    var pos = projector.unprojectVector(vector, Game.camera);

    Sound.audio.context.listener.setPosition(pos.x, pos.y, pos.z);

    vector = new THREE.Vector3(0,0,1);
    var direction = projector.unprojectVector(vector, Game.camera);
    direction = vector.sub(Game.player.body.position).normalize()

    vector = new THREE.Vector3(0,1,0);
    var up = projector.unprojectVector(vector, Game.camera);
    up = vector.sub(Game.player.body.position).normalize()

    Sound.audio.context.listener.setOrientation(direction.x, direction.y, direction.z, up.x, up.y, up.z);
}
