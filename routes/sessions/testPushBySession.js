module.exports = function (g) {
	'use strict';

	return {
		type: 'post',
		path: '/sessions/:id/push',
		sessionRequired: true,

		code: function (req, res) {
			const FCM = require('fcm-push');
			const fcm = FCM(g.config.pushServerKey);
			const log = g.log('routes/session/testPushBySession', {req, res});

			if(!req.params.id || !req.params.id.length < 8) {
				return res.status(404).send({
					message: 'Not able to find session…',
					reference: null
				});
			}
			g.models.session.find({
				where: {
					id: {
						$like: req.params.id.toLowerCase() + '%'
					}
				}
			}).then(function(session) {
				if(!session) {
					return res.status(404).send({
						message: 'Not able to find session…',
						reference: null
					});
				}
				if (!session.push_token) {
					return res.status(400).send({
						message: 'Not able to push notification, as no push token is registered in database…',
						reference: null
					});
				}

				fcm.send({
					to: session.push_token,
					notification: {
						title: 'Seid ihr noch alle daaa?',
						body: 'Bitte öffne find a room for.me, um dein Checkin zu verlängern…'
					}
				}, function (err) {
					if (err) {
						const logged = log.error(error);
						res.status(400).send({
							message: err.toString(),
							reference: logged.id
						});
					} else {
						res.send(201);
					}
				});
			}).catch(function (error) {
				const logged = log.error(error);
				res.status(500).send({
					message: 'Not able get requested session, please try again later…',
					reference: logged.id
				});
			});
		}
	};
};