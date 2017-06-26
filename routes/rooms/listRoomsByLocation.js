module.exports = function (g) {
	'use strict';

	return {
		type: 'get',
		path: '/locations/:id/rooms',
		sessionRequired: false,

		code: function (req, res) {
			const log = g.log('routes/rooms/listLocationsByRoom', {req, res});

			g.models.room.findAll({
				where: {
					location_id: req.params.id,
					visible: true
				}
			}).then(function(rooms) {
				res.send(
					rooms.map(r => ({
						id: r.id,
						name: r.name,
						inventory: {
							projectors: r.inventory_projectors,
							speakerDeskDisplay: r.inventory_speaker_desk_displays,
							speakerFloorDisplays: r.inventory_speaker_floor_displays,
							seats: r.inventory_seats,
							whiteboards: r.inventory_whiteboards,
							sound: r.inventory_sound
						},
						currentOccupation: null,
						score: 50,
						isFav: false,
						color: "green",
						freeTill: null,
						occupiedTill: null,
						thenOccupiedTill: null,
						thenFreeTill: null
					}))
				);
			}).catch(function(error) {
				const logged = log.error(error);
				res.status(500).send({
					message: 'Not able fetch rooms for this location, please try again later…',
					reference: logged.id
				});
			});
		}
	};
};