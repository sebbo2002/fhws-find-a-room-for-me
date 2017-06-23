module.exports = function () {
	'use strict';

	const config = {};

	config.port = process.env.PORT || 8080;
	config.url = process.env.URL || 'http://localhost' + (config.port === 80 ? '' : ':' + config.port);
	config.database = process.env.DB || 'mysql://127.0.0.1:3306/find-me-a-room';
	config.infoBoardURL = process.env.INFOBOARD_URL || 'https://infoboard.fhws.de/';

	config.states = [
		{
			id: 0,
			emoji: '🗣',
			title: 'Vorlesung',
			descriptionRequired: false,
			checkinAllowed: false
		},
		{
			id: 1,
			emoji: '⛔️',
			title: 'Privat',
			descriptionRequired: false,
			checkinAllowed: true
		},
		{
			id: 2,
			emoji: '🔇',
			title: 'Bitte leise sein',
			descriptionRequired: false,
			checkinAllowed: true
		},
		{
			id: 3,
			emoji: '🤓',
			title: 'Privat-Tutorium',
			descriptionRequired: true,
			checkinAllowed: true
		}
	];

	return config;
}