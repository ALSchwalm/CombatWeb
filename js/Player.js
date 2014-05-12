
function Player(_ID, name) {
    this.ID = _ID;
    this.name = name;

    // Create a sphere
    var mass = 50, radius = 1.3;
    this.shape = new CANNON.Sphere(radius);
    this.body = new CANNON.RigidBody(mass, this.shape, defaultMaterial);
    this.body.position.set(0,100,0);
    this.live = false;	//player becomes 'alive' at spawn

    this.geometry = new THREE.SphereGeometry(1.3,50,50);
    this.mesh = new THREE.Mesh( this.geometry, new THREE.MeshLambertMaterial( { color: 0xdddddd } ) );

    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
}

Player.prototype.setState = function(state) {
    this.body.position = new CANNON.Vec3(state.position.x, state.position.y, state.position.z);
    this.mesh.position = state.position;
    this.live = state.live;
}

Player.prototype.getState = function() {
    var state = {};
    state.position = this.body.position;
    state.live = this.live;
    state.name = this.name
    return state;
}

Player.prototype.spawn = function() {
    Game.scene.add(this.mesh);
    this.live = true;
}

Player.prototype.despawn = function() {
    Game.scene.remove(this.mesh);
    this.live = false;
}

Player.prototype.emitSound = function(buffer, sticky) {
    //Each player has a panner node to emit sounds
    var sound = {};
    sound.source = Sound.audio.context.createBufferSource();
    sound.source.loop = false;
    sound.panner = Sound.audio.context.createPanner();
    sound.source.connect(sound.panner);
    sound.panner.connect(Sound.audio.destination);

    var pos = this.body.position;
    sound.panner.setPosition(pos.x, pos.y, pos.z);

    sound.source.buffer = buffer;
    sound.source.start(0);

    if (sticky) {
        var start = +new Date;
        var self = this;
        var timer = setInterval(function() {
            var pos = self.body.position;
            sound.panner.setPosition(pos.x, pos.y, pos.z);
            if (+new Date - start > 1000) { //TODO get sound length from buffer
                clearInterval(timer);
            }
        }, 50);
    }

    return sound;
}
