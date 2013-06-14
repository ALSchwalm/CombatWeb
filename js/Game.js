
Game = {};

Game.FPS = 60;
Game.player = null;
Game.otherPlayers = {};

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
															4000000, // friction coefficient
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
	Game.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );

	Game.scene = new THREE.Scene();
	Game.scene.fog = new THREE.Fog( 0x000000, 0, 500 );

	var ambient = new THREE.AmbientLight( 0x222222 );
	Game.scene.add( ambient );

	var light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 10, 60, 20 );
	light.target.position.set( 0, 0, 0 );

	light.castShadow = true;

	light.shadowCameraNear = 20;
	light.shadowCameraFar = 150;//camera.far;
	light.shadowCameraFov = 150;

	light.shadowMapDarkness = 0.8;
	light.shadowMapWidth = 2*2048;
	light.shadowMapHeight = 2*2048;
	light.shadowCameraVisible = true;
	
	Game.scene.add( light );
	Game.controls = new PointerLockControls( Game.camera , Game.player.body );
	Game.scene.add( Game.controls.getObject() );

	// floor
	var geometry = new THREE.PlaneGeometry( 300, 300, 50, 50 );
	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

	var floorTexture = THREE.ImageUtils.loadTexture('./assets/floor4.gif');
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
	floorTexture.repeat.set( 7, 7 );
	
	var material = new THREE.MeshLambertMaterial(  {map:  floorTexture});
	
	var mesh = new THREE.Mesh( geometry, material );
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	Game.scene.add( mesh );

	Game.renderer = new THREE.WebGLRenderer({ antialias: true });
	Game.renderer.shadowMapEnabled = true;
	Game.renderer.shadowMapSoft = true;
	Game.renderer.setSize( window.innerWidth, window.innerHeight );
	Game.renderer.setClearColor( Game.scene.fog.color, 1 );
	Game.renderer.autoClear = false;
	
	document.body.appendChild( Game.renderer.domElement );
	
	// postprocessing
	Game.composer = new THREE.EffectComposer( Game.renderer );
	Game.composer.addPass( new THREE.RenderPass( Game.scene, Game.camera ) );
	Game.shaders = {};
	
	var fxaaEffect = new THREE.ShaderPass( THREE.FXAAShader );
	fxaaEffect.uniforms[ 'resolution' ].value.set( 1 / Interface.SCREEN_WIDTH, 1 / Interface.SCREEN_HEIGHT );

	fxaaEffect.renderToScreen = true;
	
	Game.shaders["fxaaEffect"] = fxaaEffect;
	Game.composer.addPass( fxaaEffect );
	
	
}

Game.seedWorld = function(seed) {
	Math.seedrandom(seed);

	var worldObjects = Math.random() * 50 + 2;
	
	for(var i =0; i < worldObjects; i++) {
		var halfExtents = new CANNON.Vec3(10,10,10);
		var boxShape = new CANNON.Box(halfExtents);
		var boxGeometry = new THREE.CubeGeometry(halfExtents.x*2,halfExtents.y*2,halfExtents.z*2);
		var boxBody = new CANNON.RigidBody(0,boxShape);
		boxBody.motionstate = 2;
		
		
		var material = new THREE.ShaderMaterial( {
			uniforms:  {
							redWeight: 	{ type: "f", value: Math.random() },
							blueWeight:	{ type: "f", value: Math.random() },
							greenWeight:{ type: "f", value: Math.random() }
						},
			vertexShader: document.getElementById( 'vertexShader' ).textContent,
			fragmentShader: document.getElementById( 'fragment_shader2' ).textContent
		});
		
		var tempColor = Utils.randomColor();
		var boxMesh = new THREE.Mesh( boxGeometry, material);
		
		var randomPosition = {  x : 200*Math.random() - 100,
								y : 20*Math.random() - 5,
								z : 200*Math.random() - 100}
		
		boxBody.position.set(randomPosition.x, randomPosition.y, randomPosition.z);

		boxBody.quaternion.setFromVectors(new CANNON.Vec3(Math.random(), Math.random(), Math.random()), 
											new CANNON.Vec3(Math.random(), Math.random(), Math.random()));
		
		boxBody.position.copy(boxMesh.position);
		boxBody.quaternion.copy(boxMesh.quaternion);

		boxMesh.castShadow = true;
		boxMesh.receiveShadow = true;
		boxMesh.useQuaternion = true;

		Game.scene.add(boxMesh);
		Game.world.add(boxBody);
	}
}

Game.updateState = function(newState) {
	Game.currentState = newState;
	for(var playerID in newState.players) {
		if(playerID != Game.player.ID) {
			if (Game.otherPlayers[playerID])
				Game.otherPlayers[playerID].setState(newState.players[playerID]);
			else {
				Game.otherPlayers[playerID] = new Player(playerID);
				Game.scene.add(Game.otherPlayers[playerID].mesh);
			}
		}
	}
	
	for(var playerID in Game.otherPlayers) {
		if (!newState.players[playerID]) {
			Game.scene.remove(Game.otherPlayers[playerID].mesh);
			delete Game.otherPlayers[playerID];
		}
	}
	
}

Game.interpolate = function(newState) {	
	//Drop all previous interpolated states. This prevents any kind of build up of states, if
	//we have < 60 fps etc.
	Game.projectedStateBuffer = [];
	
	if (!Game.currentState)
		Game.currentState = newState;
	var oldState = Game.currentState;

	
	Game.interpConst = (Network.latency+50)/(1000/Game.FPS); //(oldState.time - newState.time)/(1000/60); //; //80 is the time between server updates
	
	for(var i=0; i < Game.interpConst; i++) {
		var interpState = {players:{}};
		for(var player in newState.players) {
			if (oldState.players[player]) {
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
			else {
				interpState.players[player] = newState.players[player];
			}
		}
		
		Game.projectedStateBuffer.push(interpState);
	}
	Game.projectedStateBuffer.push(newState);
}


Game.begin = function () {
	var time = Date.now();
	function update() {
		if(Game.projectedStateBuffer.length > 0) {
			Game.updateState(Game.projectedStateBuffer[0]);
			Game.projectedStateBuffer.splice(0, 1);
		} else {
			console.log("empty buffer");
		}
		
		//Update physics
		Game.world.step(1/60);
		
		//Update controls
		Game.controls.update(Date.now() - time );
		
		//Render scene

		//Game.renderer.render( Game.scene, Game.camera );
		
		//Apply postprocessing
		Game.composer.render(0.1)
		
		requestAnimationFrame( update );
		Interface.stats.update();
		time = Date.now();
		
	}
	update();
	
	setInterval(Network.findLatency, 2000);
	
	setInterval(function() {
		Network.socket.emit("playerState", Game.player.getState())
	}, 20);
}