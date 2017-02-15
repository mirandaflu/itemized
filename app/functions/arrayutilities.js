// functions to handle state updates to arrays with position fields

exports.arrayWithElementsSwapped = function(array, p1, p2) {
	let newArray = array;
	let e1 = newArray[p1];
	newArray[p1] = newArray[p2];
	newArray[p1].position = p1;
	newArray[p2] = e1;
	newArray[p2].position = p2;
	return newArray;
};

exports.arrayWithElementRemoved = function(array, id) {
	let newArray = array, splice = 0;
	for (let i in newArray) {
		if (newArray[i]._id == id) {
			splice = i;
		}
		if (splice != 0) {
			newArray[i].position = newArray[i].position - 1;
		}
	}
	newArray.splice(splice, 1);
	return newArray;
};
