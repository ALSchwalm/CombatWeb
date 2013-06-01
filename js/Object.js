
function Object(body, mesh) {
	Game.world.add(body);
	Game.scene.add(mesh);
	
	this.body = body;
	this.mesh = mesh;
	
	this.mesh.castShadow = true;
	this.mesh.receiveShadow = false;
	this.mesh.useQuaternion = true;
	
	Game.objects.push(this);
}

Object.getBodies = function(objectArray){
	var bodyArray = [];
	
	for(i in objectArray) {
		bodyArray.push(objectArray[i].body);
	}
	return bodyArray;
}

Object.getMeshes = function(objectArray){
	var meshArray = [];
	
	for(i in objectArray) {
		meshArray.push(objectArray[i].mesh);
	}
	return meshArray;
}

Object.prototype.update = function() {
	this.body.position.copy(this.mesh.position);
	this.body.quaternion.copy(this.mesh.quaternion);
}

Object.prototype.setPositionVector = function(vector) {
	this.body.position.set(vector.x,vector.y,vector.z);
	this.mesh.position.set(vector.x,vector.y,vector.z);
}

Object.prototype.setPosition = function(x, y, z) {
	this.body.position.set(x,y,z);
	this.mesh.position.set(x,y,z);
}