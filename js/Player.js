
function Player(_ID) {
	this.ID = _ID;
	
	// Create a sphere
	var mass = 50, radius = 1.3;
	this.shape = new CANNON.Sphere(radius);
	this.body = new CANNON.RigidBody(mass, this.shape, defaultMaterial);
	this.body.position.set(0,100,0);

	this.geometry = new THREE.SphereGeometry(1.3,50,50);
	this.mesh = new THREE.Mesh( this.geometry, new THREE.MeshLambertMaterial( { color: 0xdddddd } ) );
	
	this.mesh.castShadow = true;
	this.mesh.receiveShadow = false;
	this.mesh.useQuaternion = true;
}

Player.prototype.setState = function(state) {
	this.body.position = new CANNON.Vec3(state.position.x, state.position.y, state.position.z);
	this.mesh.position = state.position;

}

Player.prototype.getState = function() {
	var state = {};
	state.position = this.body.position;
	
	return state;
}