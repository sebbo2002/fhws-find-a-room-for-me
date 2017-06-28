module.exports = function (g) {
	'use strict';

	return {
		type: 'get',
		path: '/locations/:id/rooms',
		sessionRequired: true,

		code: function (req, res) {
			const log = g.log('routes/rooms/listLocationsByRoom', {req, res});
			const moment = require('moment');
			const _ = require('underscore');

			const now = moment.utc();
			const endOfDay = moment.utc().endOf('day').add(4, 'hours');

			g.models.room.findAll({
				where: {
					location_id: req.params.id,
					visible: true
				},
				include: [
					{
						model: g.models.occupation,
						as: 'Occupations',
						where: {
							till: {
								$gte: now.toJSON()
							},
							from: {
								$lte: endOfDay.toJSON()
							}
						},
						required: false
					}
				]
			}).then(function (rooms) {
				rooms = rooms.map(function (r) {
					let occupanciesDone = false;
					let unblockedInMinutes;

					let result = {
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

						blocks: [],

						score: null,
						isFav: null,
						color: 'green',
						text: 'frei',
						checkinAllowed: true,

						freeTill: null,
						occupiedTill: null,
						thenOccupiedTill: null,
						thenFreeTill: null
					};

					_.chain(r.Occupations)
						.sortBy(o => new Date(o.from))
						.forEach(function (occupancy) {
							if (occupanciesDone) {
								return;
							}

							let from = moment(occupancy.from);
							let till = moment(occupancy.till);

							/*if (from.isSameOrBefore(now)) {
							 result.currentOccupancy = occupancy;
							 }
							 else if (!result.nextOccupancy) {
							 result.nextOccupancy = occupancy;
							 }*/

							if (
								result.blocks.length &&
								moment(
									result.blocks[result.blocks.length - 1].till
								).add(30, 'minutes').isSameOrAfter(from)
							) {
								result.blocks[result.blocks.length - 1].till = till;
								//result.blocks[result.blocks.length - 1].occupancies.push(occupancy);
							} else {
								result.blocks.push({
									from: from,
									till: till/*,
									 occupancies: [occupancy]*/
								});
							}
						});

					if (result.blocks.length && result.blocks[0].from.isSameOrBefore(now)) {
						result.occupiedTill = result.blocks[0].till;
						result.thenFreeTill = result.blocks[1] ? result.blocks[1].from : null;
					}
					else if (result.blocks.length) {
						result.freeTill = result.blocks[0].from;
						result.thenOccupiedTill = result.blocks[0].till;
					}
					else {
						result.freeTill = null;
					}


					/** SCORE **/
					result.score = 800;

					// minutes, this room is not blocked
					unblockedInMinutes = result.occupiedTill ? Math.floor(
							result.occupiedTill.unix() - moment().unix()
						) / 60 : 0;

					// Schlechteres Rating je kürzer frei
					result.score -= Math.round(0.5 * Math.pow(0.5 * unblockedInMinutes, 2));

					// 250 Punkte Abzug, wenn aktuell belegt
					if (result.occupiedTill) {
						result.score -= 250;
					}

					// +30 Punkte wenn Beamer vorhanden
					result.score += r.inventory_projectors ? 30 : 0;

					// +15 Punkte wenn Touch Display vorhanden
					result.score += r.inventory_speaker_desk_displays ? 15 : 0;

					// Punkte abziehen wenn Raum zu groß für Lerngruppen
					if (r.inventory_seats) {
						result.score -= Math.max(r.inventory_seats - 30, 0) ^ 2;
					}

					result.score = Math.round(result.score);
					result.score = Math.max(result.score, 0);
					result.score = Math.min(result.score, 1024);
					delete result.blocks;


					/** COLORS **/
					if (result.score > 725) {
						result.color = 'green';
					}
					else if (result.occupiedTill) {
						result.color = 'orange';
					}
					else {
						result.color = 'grey';
					}


					/** TEXT **/
					if (result.occupiedTill && result.thenFreeTill) {
						result.text = 'bis ' + result.occupiedTill.format('k:mm') + ' Uhr belegt, dann bis ' + result.thenFreeTill.format('k:mm') + ' Uhr frei';
					}
					else if (result.occupiedTill) {
						result.text = 'bis ' + result.occupiedTill.format('k:mm') + ' Uhr belegt, dann frei';
					}
					else if (result.freeTill && result.thenOccupiedTill) {
						result.text = 'bis ' + result.freeTill.format('k:mm') + ' Uhr frei, dann bis ' + result.thenOccupiedTill.format('k:mm') + ' Uhr belegt';
					}
					else if (result.freeTill) {
						result.text = 'bis ' + result.freeTill.format('k:mm') + ' Uhr frei, dann belegt';
					}
					else {
						result.text = 'frei';
					}

					return result;
				});

				rooms = _.sortBy(rooms, o => o.score * -1)
				res.send(rooms);
			}).catch(function (error) {
				const logged = log.error(error);
				res.status(500).send({
					message: 'Not able fetch rooms for this location, please try again later…',
					reference: logged.id
				});
			});
		}
	};
};