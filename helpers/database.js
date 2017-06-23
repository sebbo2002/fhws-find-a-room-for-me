module.exports = function (g) {
	const _ = require('underscore'),
		log = g.log('helpers/database'),
		models = require('../models/index.js')(g),
		database = {models: []};

	g.models = {};
	g.Sequelize = models.Sequelize;
	g.sequelize = models.sequelize;

	_.each(models.models, function (model) {
		database.models.push(model.name);
		g.models[model.name] = model;
	});

	database.getMigrator = function () {
		const Umzug = require('umzug');
		const path = require('path');

		return new Umzug({
			storage: 'sequelize',
			storageOptions: {
				sequelize: models.sequelize,
				modelName: '_migrations'
			},
			logging: log.debug,
			migrations: {
				params: [g, models.sequelize],
				path: path.resolve(__dirname + '/../migrations')
			}
		});
	};

	database.reset = function () {
		return models.sequelize.sync({force: true});
	};

	database.error = function (name, res) {
		return function (error) {
			const entry = log.error(error, res);

			res.status(500).send({
				message: 'Unfortunately due to a database error we\'re unable to process your request. Please try again later…',
				reference: entry.id
			});
		};
	};

	return database;
};