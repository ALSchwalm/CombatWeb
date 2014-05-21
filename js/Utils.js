Utils = {};

/*
  Used for interpolation. Find 'slices' intermidiate values between
  oldValue and newValue and return the 'index'th one.
*/
Utils.averageValue = function(oldValue, newValue, slices, index) {
    var diff = newValue - oldValue;
    var diff = diff / slices;
    if (index >= slices) return newValue;

    return oldValue + diff * (index+1);
}

Utils.randomColor = function() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}


// Rotate an object around an arbitrary axis in object space
var rotObjectMatrix;
Utils.rotateAroundObjectAxis = function(object, axis, radians) {
    rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);
    object.matrix.multiply(rotObjectMatrix);      // post-multiply
    object.rotation.setEulerFromRotationMatrix(object.matrix, 1);
}

Utils.threeToCannonVec3 = function(vector) {
    return new CANNON.Vec3(vector.x, vector.y, vector.z);
}

Utils.cannonToThreeVec3 = function(vector) {
    return new THREE.Vector3(vector.x, vector.y, vector.z);
}

Utils.vectMag = function(v) {
    return Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
}

Utils.getIntersects = function(position, direction, near, far) {
    var raycaster = new THREE.Raycaster(position, direction.normalize(), near, far );
    var intersects = raycaster.intersectObjects( Game.scene.children );
    return intersects;
}

Utils.getIntersectsFromPlayer = function(near, far) {
    var projector = new THREE.Projector();
    var vector = new THREE.Vector3(0,0,1);
    projector.unprojectVector(vector, Game.camera);
    var raycaster = new THREE.Raycaster(Game.player.body.position, vector.sub(Game.player.body.position).normalize() );

    var intersects = raycaster.intersectObjects( Game.scene.children );
    return intersects;
}
