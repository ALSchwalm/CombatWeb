

Utils = {};


/*
	Used for interpolation. Find 'slices' intermidiate values between
	oldValue and newValue and return the 'index'th one.
*/
Utils.averageValue = function(oldValue, newValue, slices, index) {
	var diff = newValue - oldValue;
	var diff = diff / slices;
	
	return oldValue + diff * (index+1);
}