module.exports = function (g) {
	'use strict';

	return {
		type: 'patch',
		path: '/checkins/:id',
		sessionRequired: true,

		code: function (req, res) {
			const async = require('async');
			const moment = require('moment');
			const log = g.log('routes/checkin/updateCheckin', {req, res});
			const session = req.session;
			const now = moment().utc();

			async.waterfall([
				function getModels(cb) {
					async.map({
						next: {
							model: g.models.occupation,
							where: {
								room_id: req.body.roomId,
								from: {
									$gte: now
								}
							}
						},
						checkin: {
							model: g.models.occupation,
							where: {
								id: req.params.id
							}
						},
					}, function(i, cb) {
						i.model.find({
							where: i.where,
							limit: 1
						}).then(function (result) {
							cb(null, result);
						}).catch(function (error) {
							cb(error);
						});
					}, cb);
				},
				function updateCheckin(models, cb) {
					if(!models.checkin || models.checkin.session_id !== session.id) {
						return res.status(404).send({
							message: 'Not able to find your checkin, sorry…',
							reference: null
						});
					}

					if(req.body.stateId && !g.config.states[req.body.stateId]) {
						return res.status(400).send({
							message: 'Not able to update your checkin, `stateId` not valid…',
							reference: null
						});
					}

					if(req.body.stateId) {
						models.checkin.state = req.body.stateId;
					}

					if(req.body.description !== undefined) {
						models.checkin.description = req.body.description || null;
					}
					if(models.checkin.description === null && g.config.states[req.body.stateId].commentRequired) {
						return res.status(400).send({
							message: 'Not able to update your checkin, `description` is required…',
							reference: null
						});
					}

					models.checkin.till = moment().add(2, 'hours');
					if(models.next && moment(models.next.from).isBefore(models.checkin.till)) {
						models.checkin.till = moment(models.next.from);
					}

					models.checkin.verified_till = moment().add(45, 'minutes');

					models.checkin.save().then(function () {
						res.status(200).send({
							id: models.checkin.id,
							roomId: models.checkin.room_id,
							stateId: models.checkin.state,
							description: models.checkin.description,
							from: moment(models.checkin.from).toJSON(),
							maxTill: moment(models.checkin.till).toJSON(),
							verifiedTill: moment(models.checkin.verified_till).toJSON()
						});
					}).catch(function (error) {
						const logged = log.error(error);
						res.status(500).send({
							message: 'Not able to update your checkin, please try again later…',
							reference: logged.id
						});
					});
				}
			]);
		}
	};
};