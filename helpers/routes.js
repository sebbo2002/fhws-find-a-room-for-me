/**
 * server.http.js
 *
 * Handelt den kompletten HTTP
 * Traffic des Servers.
 */

module.exports = function (g) {
	'use strict';

	const fs = require('fs'),
		path = require('path'),
		async = require('async'),
		_ = require('underscore'),
		log = g.log('helpers/routes');

	require('http').globalAgent.maxSockets = Infinity;
	g.routes = [];

	async.waterfall([
		function getRessourcePaths (cb) {
			var routePath = path.join(__dirname, '..', 'routes');
			fs.readdir(routePath, function (error, files) {
				cb(error, files.filter(file => file.substr(0, 1) !== '.').map(file => path.join(routePath, file)));
			});
		},
		function getRoutePaths (ressources, cb) {
			async.map(ressources, function (ressourcePath, cb) {
				if (ressources.indexOf('.DS_Store') > -1) {
					return cb(null, []);
				}

				fs.readdir(ressourcePath, function (error, files) {
					if (error) {
						return cb(error);
					}

					cb(null, files.map(file => path.join(ressourcePath, file)));
				});
			}, function (error, results) {
				if (error) {
					return cb(error);
				}

				let r = [];
				results.forEach(result => r = r.concat(result));
				cb(null, r);
			});
		},
		function addDynamicRoutes (routes, cb) {
			async.map(routes, function (path, cb) {
				let route;

				try {
					route = require(path);
				}
				catch (error_load) {
					log.error(error_load, {
						file: path
					});

					return cb();
				}

				try {
					route = route(g);
				}
				catch (error_open) {
					log.error(error_open, {
						file: path
					});

					return cb();
				}

				route = _.extend({
					type: 'get',
					code: function (req, res) {
						log.error('Missing `route.code`!', req.route);
						res.send(501);
					}
				}, route);

				g.app[route.type](route.path, function (req, res) {
					if (route.sessionRequired === false) {
						req.username = null;
						log.log(req.route.stack[0].method.toUpperCase() + ' ' + req.url);
						return route.code(req, res);
					}

					const auth = require('basic-auth')(req);
					if (!auth) {
						return res.status(401).send({
							message: 'Session id or token incorrect…',
							reference: null
						});
					}

					async.waterfall([
						function findSession (cb) {
							g.models.session.find({
								where: {
									id: auth.name
								}
							}).then(function (session) {
								if (!session) {
									return cb(true);
								}

								cb(null, session);
							}).catch(log.error);
						},
						function checkToken (session, cb) {
							require('bcrypt-nodejs').compare(auth.pass, session.secret, function (error, valid) {
								if (error) {
									cb(error);
								}
								else if (!valid) {
									cb(true);
								}
								else {
									cb(null, session);
								}
							});
						},
						function runCode (session, cb) {
							req.session = session;

							log.log(req.route.stack[0].method.toUpperCase(), req.url);

							if(g.Raven) {
								g.Raven.context(function () {
									g.Raven.setContext({
										user: {
											id: session.id
										}
									});

									route.code(req, res);
								});
							}else{
								route.code(req, res);
							}

							cb(null, session);
						},
						function updateSession (session, cb) {
							cb(null, session)

							if (session.last_usage && session.last_usage.getTime() >= new Date().getTime() - 1000 * 30) {
								return;
							}

							session.last_usage = new Date();
							session.user_agent = req.headers['user-agent'] || null;
							session.save().catch(function (error) {
								log.warn(error);
							});
						}
					], function (error) {
						if (error && error.error) {
							res.status(error.status || 500).send(error.error);
						}
						else if (error) {
							let logged;

							if (error !== true) {
								logged = log.error(error);
							}

							res.status(401).send({
								message: 'Session id, token or permission incorrect…',
								reference: logged ? logged.id : null
							});
						}
					});
				});

				g.routes.push(route);
				cb();
			}, cb);
		},
		function addErrorRoutes (foo, cb) {
			if(g.Raven) {
				g.app.use(g.Raven.errorHandler());
			}

			g.app.use(function onError(err, req, res) {
				res.statusCode = 500;
				res.end(JSON.stringify({
					message: 'Unknown Error, I\'m so sorry…',
					reference: res.sentry || null
				}));
			});

			cb();
		}
	], function (error) {
		if (error) {
			log.fatal(error);
			return cb(error);
		}

		log.debug('Loaded route definitions');
		g.server = g.app.listen(g.config.port, function () {
			log.info(
				'Server is waiting on port %d for you. Open http://localhost:%d to continue…',
				g.config.port, g.config.port
			);
		});
	});
};
