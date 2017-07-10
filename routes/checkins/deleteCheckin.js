module.exports = function (g) {
	'use strict';

	return {
		type: 'delete',
		path: '/checkins/:id',
		sessionRequired: true,

		code: function (req, res) {
			const moment = require('moment');
			const log = g.log('routes/checkin/deleteCheckin', {req, res});
			const session = req.session;
			const now = moment().utc();

			g.models.occupation.findById(req.params.id).then(function (checkin) {
				if(!checkin || checkin.session_id !== session.id) {
					return res.status(404).send({
						message: 'Not able to find your checkin, sorry…',
						reference: null
					});
				}

				checkin.till = now;
				checkin.verified_till = now;

				checkin.save().then(function () {
					res.sendStatus(204);
				}).catch(function (error) {
					const logged = log.error(error);
					res.status(500).send({
						message: 'Not able to delete your checkin, please try again later…',
						reference: logged.id
					});
				});
			}).catch(function (error) {
				const logged = log.error(error);
				res.status(500).send({
					message: 'Not able find your checkin, please try again later…',
					reference: logged.id
				});
			});
		}
	};
};