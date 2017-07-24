'use strict';

const async = require('async');

module.exports = {
	up: function (g, sequelize) {
		return sequelize.getQueryInterface().changeColumn(
			'occupations',
			'title',
			{
				type: g.Sequelize.STRING(128),
				allowNull: true
			}
		);
	},

	down: function (g) {
		return sequelize.getQueryInterface().changeColumn(
			'occupations',
			'title',
			{
				type: g.Sequelize.STRING(64),
				allowNull: true
			}
		);
	}
};
