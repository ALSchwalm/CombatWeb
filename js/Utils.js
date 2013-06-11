

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