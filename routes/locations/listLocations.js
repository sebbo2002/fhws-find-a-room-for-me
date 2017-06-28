module.exports = function (g) {
	'use strict';

	return {
		type: 'get',
		path: '/locations',
		sessionRequired: false,

		code: function (req, res) {
			const log = g.log('routes/locations/listLocations', {req, res});

			g.models.location.findAll().then(function (locations) {
				res.send(
					locations.map(l => ({
						id: l.id,
						name: {
							short: l.name_short,
							long: l.name_long
						},
						//description: l.description,
						geoLocation: {
							lat: l.geo_lat,
							lng: l.geo_lng
						}
					}))
				);
			}).catch(function (error) {
				const logged = log.error(error);
				res.status(500).send({
					message: 'Not able fetch locations, please try again later…',
					reference: logged.id
				});
			});
		}
	};
};