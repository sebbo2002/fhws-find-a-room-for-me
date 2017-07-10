module.exports = function (g) {
	'use strict';

	return {
		type: 'post',
		path: '/checkins',
		sessionRequired: true,

		code: function (req, res) {
			const async = require('async');
			const moment = require('moment');
			const log = g.log('routes/checkin/createCheckin', {req, res});

			if(!req.body.roomId) {
				return res.status(400).send({
					message: 'Not able to create your checkin, `roomId` missing…',
					reference: null
				});
			}
			if(!req.body.stateId) {
				return res.status(400).send({
					message: 'Not able to create your checkin, `stateId` missing…',
					reference: null
				});
			}
			if(!g.config.states[req.body.stateId]) {
				return res.status(400).send({
					message: 'Not able to create your checkin, `stateId` not valid…',
					reference: null
				});
			}
			if(g.config.states[req.body.stateId].commentRequired && !req.body.description) {
				return res.status(400).send({
					message: 'Not able to create your checkin, `description` is required for this state type…',
					reference: null
				});
			}

			async.waterfall([
				function getModels(cb) {
					async.map({
						current: {
							model: g.models.occupation,
							where: {
								room_id: req.body.roomId,
								till: {
									$gte: new Date()
								},
								from: {
									$lte: new Date()
								}
							}
						},
						next: {
							model: g.models.occupation,
							where: {
								room_id: req.body.roomId,
								from: {
									$gte: new Date()
								}
							}
						},
						room: {
							model: g.models.room,
							where: {
								id: req.body.roomId
							}
						},
						checkin: {
							model: g.models.occupation,
							where: {
								session_id: req.session.id,
								till: {
									$gte: new Date()
								},
								from: {
									$lte: new Date()
								}
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
				function checkCheckingStatus(models, cb) {
					if(!models.room) {
						res.status(400).send({
							message: 'Not able to create your checkin, `roomId` seems to be wrong…',
							reference: null
						});
						return cb(true);
					}

					if(models.checkin) {
						res.status(400).send({
							message: 'Not able to create your checkin, you already have another one…',
							reference: null
						});
						return cb(true);
					}

					if(models.current) {
						res.status(400).send({
							message: 'Not able to create your checkin, room is in use right now…',
							reference: null
						});
						return cb(true);
					}

					if(models.next && moment(models.next.from).unix() - moment().unix() <= 900) {
						console.log(models.next);
						res.status(400).send({
							message: 'Not able to create your checkin, room is in use again in a few minutes…',
							reference: null
						});
						return cb(true);
					}

					cb(null, models);
				},
				function createModel(models, cb) {
					const checkin = g.models.occupation.build();
					checkin.state = req.body.stateId;
					checkin.title = g.config.states[req.body.stateId].title;
					checkin.description = req.body.description;
					checkin.course = null;
					checkin.lecturer = null;
					checkin.from = moment();

					checkin.till = moment().add(2, 'hours');
					if(models.next && moment(models.next.from).isBefore(checkin.till)) {
						checkin.till = moment(models.next.from);
					}

					checkin.verified_till = moment().add(45, 'minutes');
					checkin.room_id = req.body.roomId;
					checkin.session_id = req.session.id;

					checkin.save().then(function () {
						cb(null, checkin);
					}).catch(function (error) {
						cb(error);
					});
				},
				function returnResult(checkin, cb) {
					res.status(200).send({
						roomId: checkin.room,
						stateId: checkin.state,
						description: checkin.description,
						from: moment(checkin.from).toJSON(),
						maxTill: moment(checkin.till).toJSON(),
						verifiedTill: moment(checkin.verified_till).toJSON()
					});

					cb();
				}
			], function(error) {
				if(error && error !== true) {
					const logged = log.error(error);
					res.status(500).send({
						message: 'Not able create checkin, please try again later…',
						reference: logged.id
					});
				}
			});
		}
	};
};