var CANNON = require('./cannon.js');

Game = {};
Game.players = {};
Game.objects = [];

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

	// Create a plane
	var groundBody = new CANNON.RigidBody(0,new CANNON.Plane(),defaultMaterial);
	groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
	Game.world.add(groundBody);
	
	var halfExtents = new CANNON.Vec3(1,1,1);
	var boxShape = new CANNON.Box(halfExtents);
	var boxBody = new CANNON.RigidBody(5,boxShape);

	boxBody.position.set(10,10,10);
	Game.world.add(boxBody);
	Game.objects.push(boxBody);
}

Game.getState = function() {
	var gameState = {
		players: {}
	};
	
	for(var player in Game.players) {
		gameState.players[player] = Game.players[player].getState();
	}
	return gameState;
}