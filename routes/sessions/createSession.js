module.exports = function (g) {
	'use strict';

	return {
		type: 'post',
		path: '/sessions',
		sessionRequired: false,

		code: function (req, res) {
			const async = require('async');
			const log = g.log('routes/session/createSession', {req, res});

			async.waterfall([
				function generateSecret (cb) {
					require('crypto').randomBytes(32, function (error, buffer) {
						if (error) {
							return cb(error);
						}

						const secret = buffer.toString('hex');
						require('bcrypt-nodejs').hash(secret, null, null, function (error, hash) {
							if (error) {
								return cb(error);
							}

							cb(null, secret, hash);
						});
					});
				},
				function createSession (secret, secretHash, cb) {
					g.models.session.create({
						secret: secretHash,
						user_agent: req.headers['user-agent'] || null,
						system_version: req.body.systemVersion || null,
						device_name: req.body.deviceName || null,
						push_token: req.body.pushToken || null
					}).then(function (session) {
						cb(null, session, secret);
					}).catch(cb);
				},
				function buildResponse (session, secret, cb) {
					cb(null, {
						id: session.id,
						secret: secret,
						systemVersion: session.system_version,
						deviceName: session.device_name,
						pushToken: session.push_token
					});
				}
			], function (error, result) {
				if (error && error.error) {
					res.status(error.status || 500).send(error.error);
				}
				else if (error) {
					const logged = log.error(error);
					res.status(500).send({
						message: 'Not able to create your session, please try again later…',
						reference: logged.id
					});
				}
				else {
					res.send(result);
				}
			});
		}
	};
};