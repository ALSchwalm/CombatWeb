
Game = {};

Game.FPS = 60;
Game.player = null;
Game.otherPlayers = {};
Game.objects = []; //Collection of object meshes

Game.receivedStateBuffer = [];
Game.projectedStateBuffer = [];

Game.setupPhysics = function(){
	// Setup our world
	Game.world = new CANNON.World();
	Game.world.quatNormalizeSkip = 0;
	Game.world.quatNormalizeFast = false;

	Game.world.defaultContactMaterial.contactEquationStiffness = 1e9;
	Game.world.defaultContactMaterial.contactEquationRegularizationTime = 3;
	
	Game.world.gravity.set(0,-40,0);
	Game.world.broadphase = new CANNON.NaiveBroadphase();

	var solver = new CANNON.GSSolver();
	solver.iterations = 7;
	solver.tolerance = 0.1;

	Game.world.solver = new CANNON.SplitSolver(solver);

	// Create a slippery material (friction coefficient = 0.0)
	defaultMaterial = new CANNON.Material("defaultMaterial");
	var physicsContactMaterial = new CANNON.ContactMaterial(defaultMaterial,
															defaultMaterial,
															0.4, // friction coefficient
															0.3  // restitution
															);
	// We must add the contact materials to the world
	Game.world.addContactMaterial(physicsContactMaterial);
	
	Game.player = new Player(Network.socket.socket.sessionid);
	Game.world.add(Game.player.body);

	// Create a plane
	var groundBody = new CANNON.RigidBody(0,new CANNON.Plane(),defaultMaterial);
	groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
	Game.world.add(groundBody);
}


Game.setupRender = function() {
	Game.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );

	Game.scene = new THREE.Scene();
	Game.scene.fog = new THREE.Fog( 0x000000, 0, 500 );

	var ambient = new THREE.AmbientLight( 0x222222 );
	Game.scene.add( ambient );

	var light = new THREE.SpotLight( 0xffffff );
	light.position.set( 10, 30, 20 );
	light.target.position.set( 0, 0, 0 );

	light.castShadow = true;

	light.shadowCameraNear = 20;
	light.shadowCameraFar = 50;//camera.far;
	light.shadowCameraFov = 40;

	light.shadowMapDarkness = 0.8;
	light.shadowMapWidth = 2*512;
	light.shadowMapHeight = 2*512;
	light.shadowCameraVisible = true;
	
	Game.scene.add( light );
	Game.controls = new PointerLockControls( Game.camera , Game.player.body );
	Game.scene.add( Game.controls.getObject() );

	// floor
	var geometry = new THREE.PlaneGeometry( 300, 300, 50, 50 );
	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

	var material = new THREE.MeshLambertMaterial( { color: 0xdddddd } );

	var mesh = new THREE.Mesh( geometry, material );
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	Game.scene.add( mesh );

	Game.renderer = new THREE.WebGLRenderer({ antialias: true });
	Game.renderer.shadowMapEnabled = true;
	Game.renderer.shadowMapSoft = true;
	Game.renderer.setSize( window.innerWidth, window.innerHeight );
	Game.renderer.setClearColor( Game.scene.fog.color, 1 );

	document.body.appendChild( Game.renderer.domElement );
}

Game.updateState = function(newState) {

	for(var playerID in newState.players) {
		if(playerID != Game.player.ID) {
			Game.otherPlayers[playerID].update(newState.players[playerID]);
		}
		else {
			Game.player.setState(newState.players[playerID]);
		}
	}

	for(var i=0; i < (Network.latency / (1000/60) - 1); i++) {
		console.log("rewind");
		Game.world.step(1/Game.FPS);
	}
}

Game.interpolate = function() {


	//Only interpolate between received packets
	if (Game.receivedStateBuffer.length < 2) return;
	
	//Drop all previous interpolated states. This prevents any kind of build up of states, if
	//we have < 60 fps etc.
	Game.projectedStateBuffer = [];
	var oldState = Game.receivedStateBuffer[Game.receivedStateBuffer.length-2];
	var newState = Game.receivedStateBuffer[Game.receivedStateBuffer.length-1];
	
	Game.interpConst = 5;
	
	for(var i=0; i < Game.interpConst; i++) {
		var interpState = {players:{}};
		for(var player in newState.players) {
			interpState.players[player] = {
				position : { x : Utils.averageValue(oldState.players[player].position.x, 
													newState.players[player].position.x,
													Game.interpConst,
													i),
							y : Utils.averageValue(oldState.players[player].position.y, 
													newState.players[player].position.y,
													Game.interpConst,
													i),
							z : Utils.averageValue(oldState.players[player].position.z, 
													newState.players[player].position.z,
													Game.interpConst,
													i)
				}
			}
		}
		
		Game.projectedStateBuffer.push(interpState);
	}
	Game.receivedStateBuffer.splice(Game.receivedStateBuffer.indexOf(oldState), 1);
}


Game.begin = function () {
	function update() {
		for(var i in Game.objects) {
			//Game.objects[i].update();
		}
		
		if(Game.projectedStateBuffer.length > 0) {
			Game.updateState(Game.projectedStateBuffer[0]);
			Game.projectedStateBuffer.splice(0, 1);
		}

		Game.controls.update( );
		Game.renderer.render( Game.scene, Game.camera );
		//requestAnimationFrame( update );
		//Network.socket.emit('stateUpdate', null);
	}
	setInterval(update, 1000/60);
	
	setInterval(Network.findLatency, 2000);
	
}