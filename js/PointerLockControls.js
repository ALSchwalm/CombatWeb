/**
 * @author mrdoob / http://mrdoob.com/
 * @author schteppe / https://github.com/schteppe
 */
 var PointerLockControls = function ( camera, cannonBody ) {

    var eyeYPos = 2; // eyes are 2 meters above the ground
    var scope = this;

    var pitchObject = new THREE.Object3D();
    pitchObject.add( camera );

    var yawObject = new THREE.Object3D();
    yawObject.position.y = 2;
    yawObject.add( pitchObject );

    var quat = new THREE.Quaternion();


    var PI_2 = Math.PI / 2;
	
    var onMouseMove = function ( event ) {

        if ( scope.enabled === false ) return;

        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        yawObject.rotation.y -= movementX * 0.002;
        pitchObject.rotation.x -= movementY * 0.002;

        pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );
		
    };

    var onKeyDown = function ( event ) {
		Network.socket.emit('keyDown', event.keyCode);
    };

    var onKeyUp = function ( event ) {

		Network.socket.emit('keyUp', event.keyCode);

    };

    document.addEventListener( 'mousemove', onMouseMove, false );
	document.addEventListener( 'keyup', onKeyUp, false );
	document.addEventListener( 'keydown', onKeyDown, false );
	
	this.enabled = false;
	
    this.getObject = function () {
        return yawObject;
    };

    this.getDirection = function(targetVec){
        targetVec.set(0,0,-1);
        targetVec.applyQuaternion(quat);
    }
	
	this.sendMousePosition = function() {
		var mouseState = {
			rotation : yawObject.rotation,
			matrixWorld : yawObject.matrixWorld
		};
		Network.socket.emit('mouseState', mouseState);
	}
	
	this.update = function () {
		cannonBody.position.copy(yawObject.position);
	}
	
};