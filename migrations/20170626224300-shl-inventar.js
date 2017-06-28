'use strict';

const async = require('async');
const _ = require('underscore');
const Bluebird = require('bluebird');

module.exports = {
	up: function (g) {
		const inventory = [
			{
				location: 'SHL',
				room: 'H.1.1',
				inventory_projectors: 2,
				inventory_speaker_desk_displays: 2,
				inventory_speaker_floor_displays: 1,
				inventory_seats: 218,
				inventory_whiteboards: 1,
				inventory_sound: true
			},
			{
				location: 'SHL',
				room: 'H.1.11',
				inventory_projectors: 2,
				inventory_speaker_desk_displays: 2,
				inventory_seats: 39
			},
			{
				location: 'SHL',
				room: 'H.1.2',
				inventory_seats: 119
			},
			{
				location: 'SHL',
				room: 'H.1.3',
				inventory_seats: 119
			},
			{
				location: 'SHL',
				room: 'H.1.5',
				inventory_seats: 83
			},
			{
				location: 'SHL',
				room: 'H.1.6',
				inventory_seats: 83
			},
			{
				location: 'SHL',
				room: 'H.1.7',
				inventory_seats: 83
			},
			{
				location: 'SHL',
				room: 'I.2.1',
				inventory_speaker_desk_displays: 2,
				inventory_seats: 20
			},
			{
				location: 'SHL',
				room: 'I.2.14',
				inventory_seats: 24
			},
			{
				location: 'SHL',
				room: 'I.2.15',
				inventory_seats: 32
			},
			{
				location: 'SHL',
				room: 'I.2.15a',
				inventory_seats: 20
			},
			{
				location: 'SHL',
				room: 'I.2.18/19',
				inventory_speaker_desk_displays: 2,
				inventory_seats: 68
			},
			{
				location: 'SHL',
				room: 'I.2.16',
				inventory_speaker_desk_displays: 1,
				inventory_seats: 27
			},
			{
				location: 'SHL',
				room: 'I.3.20',
				inventory_speaker_desk_displays: 2,
				inventory_seats: 54
			},
			{
				location: 'SHL',
				room: 'I.3.24',
				inventory_seats: 32
			}
		];

		return new Bluebird(function (resolve, reject) {
			async.mapSeries(inventory, function (item, cb) {
				g.models.location.find({
					where: {
						name_short: item.location
					}
				}).then(function (location) {
					if (!location) {
						return cb(new Error('Location not found: `' + item.location + '`'));
					}

					g.models.room.find({
						where: {
							name: item.room,
							location_id: location.id
						}
					}).then(function (room) {
						if (!room) {
							//return cb(new Error('Room not found: `' + item.room + '`'));
							room = g.models.room.build({
								name: item.room,
								infoboard_name: item.room,
								location_id: location.id
							});
						}

						_.each(item, function (value, key) {
							if (['location', 'room'].indexOf(key) === -1) {
								room[key] = value;
							}
						});

						room.save().then(function () {
							cb();
						}).catch(cb);
					}).catch(cb);
				}).catch(cb);
			}, function (err) {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	},

	down: function (g, sequelize) {
		return null;
	}
};
