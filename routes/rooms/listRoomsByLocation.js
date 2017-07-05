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
					},
					{
						model: g.models.session,
						as: 'Favorites',
						where: {
							id: req.session.id
						},
						required: false
					}
				]
			}).then(function (rooms) {
				rooms = rooms.map(function (r) {
					const timezone = 'Europe/Berlin';
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
						isFav: !!r.Favorites.length,
						color: 'green',
						text: 'frei',
						checkinAllowed: false,

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

					// Schlechteres Rating je kürzer frei
					if(result.freeTill) {
						unblockedInMinutes = Math.floor(result.freeTill.unix() - moment().unix()) / 60;
						result.score -= Math.round(0.5 * Math.pow(0.1 * Math.max((6 * 60) - unblockedInMinutes, 0), 2));
					}

					// Schlechteres Rating länger belegt
					if(result.occupiedTill) {
						unblockedInMinutes = Math.floor(result.occupiedTill.unix() - moment().unix()) / 60;
						result.score -= Math.round(0.5 * Math.pow(0.5 * unblockedInMinutes, 2));
					}

					// +5 wenn danach komplett frei
					if(result.occupiedTill && !result.thenFreeTill) {
						result.score += 5;
					}
					else if(result.occupiedTill && result.thenFreeTill) {
						unblockedInMinutes = Math.floor(result.thenFreeTill.unix() - result.occupiedTill.unix()) / 60;
						result.score -= Math.round(0.1 * unblockedInMinutes);
					}

					// 100 Punkte Abzug, wenn aktuell belegt
					if (result.occupiedTill) {
						result.score -= 100;
					}

					// +10 Punkte wenn Beamer vorhanden
					result.score += r.inventory_projectors ? 10 : 0;

					// +5 Punkte wenn Touch Display vorhanden
					result.score += r.inventory_speaker_desk_displays ? 5 : 0;

					// Punkte abziehen wenn Raum zu groß für Lerngruppen
					if (r.inventory_seats) {
						result.score -= Math.min(Math.max(r.inventory_seats - 30, 0), 100);
					}

					result.score = Math.round(result.score);
					result.score = Math.max(result.score, 0);
					result.score = Math.min(result.score, 1024);
					delete result.blocks;


					/** COLORS **/
					if (result.score >= 700) {
						result.color = 'green';
					}
					else if (result.freeTill) {
						result.color = 'orange';
					}
					else {
						result.color = 'grey';
					}


					/** TEXT **/
					if (result.occupiedTill && result.thenFreeTill) {
						result.text = 'bis ' + result.occupiedTill.tz(timezone).format('H:mm') + ' Uhr belegt, ' +
							'dann bis ' + result.thenFreeTill.tz(timezone).format('H:mm') + ' Uhr frei';
					}
					else if (result.occupiedTill) {
						result.text = 'bis ' + result.occupiedTill.tz(timezone).format('H:mm') + ' Uhr belegt, ' +
							'dann frei';
					}
					else if (result.freeTill && result.thenOccupiedTill) {
						result.text = 'bis ' + result.freeTill.tz(timezone).format('H:mm') + ' Uhr frei, ' +
							'dann bis ' + result.thenOccupiedTill.tz(timezone).format('H:mm') + ' Uhr belegt';
					}
					else if (result.freeTill) {
						result.text = 'bis ' + result.freeTill.tz(timezone).format('H:mm') + ' Uhr frei, dann belegt';
					}
					else {
						result.text = 'frei';
					}

					/** CHECKIN ALLOWED **/
					result.checkinAllowed = result.freeTill && result.freeTill.unix() - moment().unix() > 1800;

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