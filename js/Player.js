
function Player(_ID) {
	this.ID = _ID;
	
	// Create a sphere
	var mass = 50, radius = 1.3;
	this.shape = new CANNON.Sphere(radius);
	this.body = new CANNON.RigidBody(mass, this.shape, defaultMaterial);
	this.body.position.set(0,radius,0);
	this.body.linearDamping = 0.99;
	
	this.geometry = new THREE.SphereGeometry(1.3,50,50);
	this.mesh = new THREE.Mesh( this.geometry, new THREE.MeshLambertMaterial( { color: 0xdddddd } ) );
}

Player.prototype.getPostDetails = function() {
	var obj = {};
	obj.position = this.body.position;
	return obj;
}

Player.prototype.update = function(playerState) {
	this.body.position = playerState.position;
	this.mesh.position = playerState.position;
}