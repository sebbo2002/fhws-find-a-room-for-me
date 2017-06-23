var s4 = function s4 () {
	'use strict';
	return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
};

module.exports = function guid () {
	'use strict';
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};