'use strict';

const async = require('async');

module.exports = {
	up: function (g) {
		return g.models.location.create({
			name_short: 'VCC',
			name_long: 'Vogel Convention Center',
			name_infoboard: 'VCC',
			description: 'Ausweichlocation für Prüfungen und größere Veranstaltungen…',
			geo_lat: 49.7965343,
			geo_lng: 9.9008553
		})
	},

	down: function (g, sequelize) {
		return sequelize.location.sync({force: true});
	}
};
