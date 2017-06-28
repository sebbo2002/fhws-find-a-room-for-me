module.exports = function (g) {
	'use strict';

	return {
		type: 'patch',
		path: '/sessions/:id',
		sessionRequired: true,

		code: function (req, res) {
			const async = require('async');
			const log = g.log('routes/session/updateSession', {req, res});

			const session = req.session;

			if (req.body.systemVersion !== undefined) {
				session.system_version = req.body.systemVersion;
			}
			if (req.body.deviceName !== undefined) {
				session.device_name = req.body.deviceName;
			}
			if (req.body.pushToken !== undefined) {
				session.push_token = req.body.pushToken;
			}

			session.save().then(function () {
				res.send({
					id: session.id,
					systemVersion: session.system_version,
					deviceName: session.device_name,
					pushToken: session.push_token
				});
			}).catch(function (error) {
				const logged = log.error(error);
				res.status(500).send({
					message: 'Not able to update your session, please try again later…',
					reference: logged.id
				});
			});
		}
	};
};