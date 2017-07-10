module.exports = function (g) {
	'use strict';

	return {
		type: 'get',
		path: '/checkins',
		sessionRequired: true,

		code: function (req, res) {
			const log = g.log('routes/checkins/listCheckins', {req, res});
			const moment = require('moment');
			const now = moment.utc();

			g.models.occupation.findAll({
				where: {
					session_id: req.session.id,
					till: {$gte: now},
					from: {$lte: now}
				},
				order: [['from', 'ASC'], ['till', 'ASC']]
			}).then(function (checkins) {
				res.send(checkins.map(function (checkin) {
					return {
						id: checkin.id,
						roomId: checkin.room_id,
						stateId: checkin.state,
						description: checkin.description,
						from: moment(checkin.from).toJSON(),
						maxTill: moment(checkin.till).toJSON(),
						verifiedTill: moment(checkin.verified_till).toJSON()
					};
				}));
			}).catch(function (error) {
				const logged = log.error(error);
				res.status(500).send({
					message: 'Not able get your checkins, please try again later…',
					reference: logged.id
				});
			});
		}
	};
};