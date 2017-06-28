module.exports = function (g) {
	'use strict';

	const Sequelize = require('sequelize');
	const fs = require('fs');
	const log = g.log('models');

	let result = {models: {}};

	// initialize sequalize.js
	const sequelize = new Sequelize(g.config.database, {
		logging: function (text) {
			log.log(text);
		},
		define: {
			timestamps: true,
			underscored: true,
			charset: 'utf8',
			collate: 'utf8_general_ci'
		},
		pool: {
			maxConnections: 5,
			maxIdleTime: 30
		}
	});


	// load models (sync)
	fs.readdirSync(__dirname).forEach(function (modelFile) {
		const name = modelFile.split('.')[0];
		let definition;

		if (name && name !== 'index') {
			definition = require('./' + modelFile)(Sequelize);
			result.models[name] = sequelize.define(name, definition.attributes);
		}
	});


	// setup sequelize model associations
	result.models.location.hasMany(result.models.room, {as: 'Rooms'});
	result.models.room.belongsTo(result.models.location);

	result.models.room.hasMany(result.models.occupation, {as: 'Occupations'});
	result.models.occupation.belongsTo(result.models.room);

	result.models.session.belongsToMany(result.models.room, {as: 'Favorites', through: 'favorites'});
	result.models.room.belongsToMany(result.models.session, {as: 'Favorites', through: 'favorites'});


	// sequelize
	result.sequelize = sequelize;


	return result;
};
