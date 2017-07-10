module.exports = function (options) {
	'use strict';

	const EventEmitter = require('events').EventEmitter;
	const g = new EventEmitter();

	options = options || {};

	// config & version
	g.config = require('./config.js')();
	g.version = require('../package.json').version;

	// is
	g.is = {
		dev: process.env.NODE_ENV !== 'production'
	};

	// shutdown
	g.onShutdown = function (name, cb) {
		g.onShutdown.callbacks = g.onShutdown.callbacks || [];
		g.onShutdown.callbacks.push({name: name, cb: cb});
	};
	g.shutdown = function () {
		const log = g.log('shutdown');
		let count = g.onShutdown.callbacks ? g.onShutdown.callbacks.length : 0;

		log.debug('Initialize shutdown…');

		g.onShutdown.callbacks.forEach(function (module) {
			const timeout = setTimeout(function () {
				log.debug('Module `%s` still not ready after 5s…', module.name);
			}, 5000);

			module.cb(function () {
				count -= 1;
				clearTimeout(timeout);
				log.debug('Module `%s` is ready, %d left…', module.name, count);

				if (count <= 0) {
					log.warn('Shutdown…');
					process.exit();
				}
			});
		});

		if(count === 0) {
			log.warn('Instant shutdown…');
			process.exit();
		}

		setTimeout(function () {
			log.warn('Shutdown timeout…');
			process.exit();
		}, 7500);
	};

	// ExpressJS App
	if (!options.noServer) {
		g.express = require('express');
		g.app = g.express();

		g.app.use(require('body-parser').json());
		g.app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal'])
	}

	// Logger
	g.log = require('./log.js')(g);

	// Database Connection
	g.database = require('./database')(g);

	// Object mit Server Instanzen
	if (!options.noServer) {
		require('./routes.js')(g);
	}

	return g;
};
