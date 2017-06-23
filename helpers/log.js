/**
 * log.js
 *
 *  - log
 *  - debug
 *  - info
 *  - warn
 *  - error
 *  - context
 *  - wrap
 */

module.exports = function (g) {
	'use strict';

	const EventEmitter = require('events').EventEmitter;
	const bunyan = require('bunyan');
	const raven = require('raven');
	const _ = require('underscore');
	const os = require('os');
	const util = require('util');
	const http = require('http');
	const uuid = require('./uuid.js');
	const logger = bunyan.createLogger({
		name: 'find-me-a-room server',
		level: 'trace',
		serializers: {req: bunyan.stdSerializers.req}
	});
	const clients = {};
	const globalTags = {};


	// add os stuff
	globalTags.nodejs = process.version;


	if (g.config.sentry) {
		clients.sentry = new raven.Client(g.config.sentry);
	}

	const log = function (s) {
		var t = {},
			i;

		s = _.extend({}, {
			id: 0,
			error: null,
			time: null,
			level: 'log',
			module: null,
			param_message: null,
			report: false,
			request: null,
			user: null,
			extra: {},
			options: {},
			callback: null
		}, s);
		s.options = s.options || {};

		// add Time
		s.time = new Date().toGMTString();

		// add custom Tags
		_.extend(s.extra, globalTags);

		// add request
		if (s.options && s.options.request && s.options.request instanceof http.IncomingMessage) {
			s.request = s.options.request;
		}

		// add user
		if (s.options && s.options.user) {
			s.user = s.options.user;
		}

		// add path infos
		if (s.options && s.options.request) {
			s.pathname = s.options.request._parsedUrl.pathname;
		}


		// analyse arguments
		if (!s.error && (!s.args || s.args.length === 0)) {
			return null;
		}
		for (i in s.args) {
			if (s.args.hasOwnProperty(i)) {
				t.argument = s.args[i];
				i = parseInt(i, 10);

				if (i === 0 && _.isString(t.argument)) {
					s.error = t.argument;
					t.isString = 1;
					t.variables = [t.argument];
				}
				else if (i === 0) {
					s.error = t.argument;
				}
				else if (t.argument instanceof http.IncomingMessage) {
					s.options.request = t.argument;
				}
				else if (parseInt(i, 10) === s.args.length - 1 && _.isObject(t.argument)) {
					_.extend(s.extra, t.argument);
					if (t.isString) {
						t.variables.push(t.argument);
					}
				}
				else if (t.isString) {
					t.variables.push(t.argument);
				}
			}
		}


		// generate id
		s.id = uuid().substr(0, 32).toUpperCase();

		// replace variables
		if (t.isString) {
			s.param_message = s.error;
			s.error = util.format.apply(null, t.variables);
		}

		// sentry
		if (s.report && !g.is.dev && clients.sentry) {
			clients.sentry[s.level === 'error' ? 'captureException' : 'captureMessage'](s.error, {
				level: s.level,
				extra: _.extend({}, s.extra, {
					id: s.id,
					module: s.module,
					machine: os.hostname() + ':' + (process.env.PORT || g.config.port),
					user: s.user
				})
			});
		}

		// json log
		logger[s.level === 'warning' ? 'warn' : s.level](_.extend({}, s.extra, {
			id: s.id,
			module: s.module,
			username: s.user,
			machine: os.hostname() + ':' + (process.env.PORT || g.config.port),
			pathname: s.pathname,
			req: s.request
		}), s.error);

		// Exception
		if (g.is.dev && ['fatal', 'error'].indexOf(s.level) >= 0 && s.error instanceof Error) {
			throw s.error;
		}

		return s;
	};

	// process exit log
	if (!g.is.dev) {
		process.on('uncaughtException', function (err) {
			let myLog;

			myLog = log({
				error: err,
				level: 'error',
				module: 'root',
				report: true
			});

			myLog(err);
		});
	}


	return function (module, options) {
		const pub = {};

		pub.fatal = function () {
			options = options || {};

			let myLog = log({
				args: arguments,
				options: options,
				level: 'fatal',
				module: module,
				report: true
			});

			_.defer(options.callback || function () {
					process.exit(1);
				});

			return myLog;
		};

		pub.error = function () {
			return log({
				args: arguments,
				options: options,
				level: 'error',
				module: module,
				report: true
			});
		};

		pub.warn = function () {
			return log({
				args: arguments,
				options: options,
				level: 'warning',
				module: module,
				report: true
			});
		};

		pub.info = function () {
			return log({
				args: arguments,
				options: options,
				level: 'info',
				module: module,
				report: false
			});
		};

		pub.debug = function () {
			return log({
				args: arguments,
				options: options,
				level: 'debug',
				module: module,
				report: false
			});
		};

		pub.log = function () {
			return log({
				args: arguments,
				options: options,
				level: 'debug',
				module: module,
				report: false
			});
		};

		pub.context = function (method, cb) {
			let returned,
				error;

			try {
				returned = method();
			}
			catch (err) {
				error = log({
					error: err,
					options: options,
					level: 'error',
					module: module,
					report: true
				});
			}

			if (_.isFunction(cb)) {
				cb(error || null, returned);
			}

			return returned;
		};

		pub.wrap = function (method, cb) {
			return function () {
				return pub.context(method, cb);
			};
		};

		return pub;
	};
};
