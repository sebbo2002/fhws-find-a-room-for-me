'use strict';

const async = require('async');

module.exports = {
	up: function (g) {
		return g.models.occupation.sync({force: true});
	},

	down: function (g) {
		return g.models.occupation.sync({force: true});
	}
};
