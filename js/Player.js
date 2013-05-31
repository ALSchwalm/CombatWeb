
function Player(_ID) {
	this.ID = _ID;
	
	// Create a sphere
	var mass = 50, radius = 1.3;
	this.shape = new CANNON.Sphere(radius);
	this.body = new CANNON.RigidBody(mass, this.shape, physicsMaterial);
	this.body.position.set(0,radius,0);
	this.body.linearDamping = 0.99;
	
}
