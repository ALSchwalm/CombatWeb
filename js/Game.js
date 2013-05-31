
Game = {};

Game.FPS = 60;
Game.players = []

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
	physicsMaterial = new CANNON.Material("physicsMaterial");
	var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
															physicsMaterial,
															0.4, // friction coefficient
															0.3  // restitution
															);
	// We must add the contact materials to the world
	Game.world.addContactMaterial(physicsContactMaterial);
	
	Game.players.push(new Player(0));
	
	Game.world.add(Game.players[0].body);

	// Create a plane
	var groundShape = new CANNON.Plane();
	var groundBody = new CANNON.RigidBody(0,groundShape,physicsMaterial);
	groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
	Game.world.add(groundBody);
}


Game.setupRender = function() {
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );

	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x000000, 0, 500 );

	var ambient = new THREE.AmbientLight( 0x222222 );
	scene.add( ambient );

	light = new THREE.SpotLight( 0xffffff );
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
	scene.add( light );
	
	Game.controls = new PointerLockControls( camera , Game.players[0].body );
	scene.add( Game.controls.getObject() );

	// floor
	geometry = new THREE.PlaneGeometry( 300, 300, 50, 50 );
	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

	material = new THREE.MeshLambertMaterial( { color: 0xdddddd } );

	mesh = new THREE.Mesh( geometry, material );
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	scene.add( mesh );

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.shadowMapEnabled = true;
	renderer.shadowMapSoft = true;
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( scene.fog.color, 1 );

	document.body.appendChild( renderer.domElement );
	
	
	// Add boxes
	var halfExtents = new CANNON.Vec3(1,1,1);
	var boxShape = new CANNON.Box(halfExtents);
	var boxGeometry = new THREE.CubeGeometry(halfExtents.x*2,halfExtents.y*2,halfExtents.z*2);
	boxBody = new CANNON.RigidBody(5,boxShape);
	boxMesh = new THREE.Mesh( boxGeometry, material );
	Game.world.add(boxBody);
	scene.add(boxMesh);
	boxBody.position.set(10,10,10);
	boxMesh.position.set(10,10,10);
	boxMesh.castShadow = true;
	boxMesh.receiveShadow = false;
	boxMesh.useQuaternion = true;
	
	//objects.push(boxMesh);
}


Game.begin = function () {
	var time = Date.now();
	
	function update() {
		requestAnimationFrame( update );
		if(Game.controls.enabled){
			Game.world.step(1/Game.FPS);
		}
		boxBody.position.copy(boxMesh.position);
		boxBody.quaternion.copy(boxMesh.quaternion);


		Game.controls.update( Date.now() - time );
		renderer.render( scene, camera );
		time = Date.now();
	}
	update();
}