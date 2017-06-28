module.exports = function (g) {
	'use strict';

	return {
		type: 'patch',
		path: '/rooms/:id',
		sessionRequired: true,

		code: function (req, res) {
			const log = g.log('routes/rooms/updateRoom', {req, res});
			const moment = require('moment');
			const _ = require('underscore');

			g.models.room.find({
				where: {
					id: req.params.id,
					visible: true
				}
			}).then(function (room) {
				if (!room) {
					return res.status(404).send('Not able to find room with this ID. Sorry.');
				}

				if (req.body.isFav === true) {
					room.addFavorite(req.session).then(function () {
						res.sendStatus(204);
					}).catch(function (error) {
						const logged = log.error(error);
						res.status(500).send({
							message: 'Not able to update room, please try again later…',
							reference: logged.id
						});
					});
				}
				else if (req.body.isFav === false) {
					room.removeFavorite(req.session).then(function () {
						res.sendStatus(204);
					}).catch(function (error) {
						const logged = log.error(error);
						res.status(500).send({
							message: 'Not able to update room, please try again later…',
							reference: logged.id
						});
					});
				}
				else {
					console.log(req.body);
					res.sendStatus(204);
				}
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