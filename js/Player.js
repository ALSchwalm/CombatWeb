
makeLocalPlayer = function(ID, name) {
    if (Game.player) {
        throw "Local player already exists";
    }

    var player = new Player(ID, name);
    player.grappling = false;
    player.grappleConstraint = null;

    var targetShape = new CANNON.Sphere(0.1);
    player.grappleTarget = new CANNON.RigidBody(0,targetShape);
    Game.world.add(player.grappleTarget);

    player.attachGrapple = function() {
        if (player.grappling) { return false; }
        player.grappling = true;

        var intersects = Utils.getIntersectsFromPlayer(0, Settings.grappleDistance);

        if (!intersects || (intersects && intersects[0].distance > Settings.grappleDistance)) {
            player.grappling = false; return false;
        }
        player.grappleTarget.shape.radius = 0.1;
        player.grappleTarget.position = new CANNON.Vec3(intersects[0].point.x,
                                                        intersects[0].point.y,
                                                        intersects[0].point.z);

        player.grappleConstraint = new CANNON.DistanceConstraint(player.body,
                                                                 player.grappleTarget,
                                                                 0,
                                                                 Settings.grappleForce);
        Game.world.addConstraint(player.grappleConstraint);
        Game.controls.enabled = false;

    }

    player.detachGrapple = function() {
        if (!player.grappling) { return false; }
        player.grappling = false;
        Game.world.removeConstraint(player.grappleConstraint);
        player.grappleTarget.shape.radius = 0;
        Game.controls.enabled = true;
    }

    return player;
}


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

Player.prototype.death = function() {
    this.emitSound(Sound.buffers["death"]);
    this.live = false;
    self = this;
    setTimeout( function() {
	self.live = true;
	self.body.position.set(Game.spawn.x,
			       Game.spawn.y,
			       Game.spawn.z)
        self.body.velocity.set(0, 0, 0);
	Network.socket.emit('playerSpawn');
    }, 3000);
}

Player.prototype.emitSound = function(buffer, sticky, distanceModel, rolloffFactor) {
    //Each player has a panner node to emit sounds
    var sound = {};
    sound.source = Sound.audio.context.createBufferSource();
    sound.source.loop = false;
    sound.panner = Sound.audio.context.createPanner();
    sound.source.connect(sound.panner);
    sound.panner.connect(Sound.audio.destination);

    sound.panner.distanceModel = distanceModel || "linear";
    sound.panner.rolloffFactor = rolloffFactor || 0.4;

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
