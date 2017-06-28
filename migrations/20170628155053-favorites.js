'use strict';

const async = require('async');

module.exports = {
	up: function (g, sequelize) {
		return sequelize.sync()
	},
	down: function () {
		return null;
	}
};
