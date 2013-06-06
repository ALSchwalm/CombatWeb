var CANNON = require('./cannon.js');
var controls = require('./ControlsServer.js');
var THREE = require('./ThreeServer.js');

function Player(_ID) {
	this.ID = _ID;

	var mass = 50, radius = 1.3;
	this.shape = new CANNON.Sphere(radius);
	this.body = new CANNON.RigidBody(mass, this.shape, defaultMaterial);
	this.body.position.set(0,radius*2,0);
	this.body.linearDamping = 0.99;
	
	this.camera = new THREE.Object3D();
	this.controls = new controls.PointerLockControls(this.camera, this.body);
}

Player.prototype.getState = function() {
	var state = {};
	state.position = this.body.position;
	
	return state;
}

module.exports = {
  Player: Player 
  /*
  bar: function () {

  }*/
};