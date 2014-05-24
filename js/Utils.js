

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

Utils.vectMag = function(v) {
    return Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
}

// Taken from http://stackoverflow.com/a/19663677
Utils.hexToRGBA = function(hex,opacity){
    hex = hex.replace('#','');
    r = parseInt(hex.substring(0,2), 16);
    g = parseInt(hex.substring(2,4), 16);
    b = parseInt(hex.substring(4,6), 16);
    result = 'rgba('+r+','+g+','+b+','+opacity/100+')';
    return result;
}
