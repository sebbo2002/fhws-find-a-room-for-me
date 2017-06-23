'use strict';

const async = require('async');

module.exports = {
	up: function (g, sequelize) {
		return sequelize.sync({force: true})
	},
	down: function (g, sequelize) {
		return sequelize.sync({force: true});
	}
};
