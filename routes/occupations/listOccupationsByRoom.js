module.exports = function (g) {
	'use strict';

	return {
		type: 'get',
		path: '/rooms/:id/occupations',
		sessionRequired: true,

		code: function (req, res) {
			const log = g.log('routes/occupations/listOccupationsByRoom', {req, res});
			const moment = require('moment');
			const now = moment.utc();

			g.models.occupation.findAll({
				where: {
					room_id: req.params.id,
					till: {
						$gte: now
					}
				},
				order: [['from', 'ASC'], ['till', 'ASC']]
			}).then(function (occupations) {
				res.send(occupations.map(function(data) {
					const state = g.config.states.filter(state => state.id === data.state)[0] || {};

					return {
						id: data.id,
						emoji: state.emoji || null,
						title: data.title || null,
						description: data.description || null,
						course: data.course || null,
						lecturer: data.lecturer || null,
						from: moment(data.from).toJSON(),
						till: moment(data.till).toJSON()
					};
				}));
			}).catch(function (error) {
				const logged = log.error(error);
				res.status(500).send({
					message: 'Not able fetch occupations for this room, please try again later…',
					reference: logged.id
				});
			});
		}
	};
};