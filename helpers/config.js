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
			description: null,
			commentRequired: false,
			checkinAllowed: false
		},
		{
			id: 1,
			emoji: '⛔️',
			title: 'Privat',
			description: 'Wenn du „Privat“ auswählst, bekommen alle Kommilitonen den Raum als belegt angezeigt.',
			commentRequired: false,
			checkinAllowed: true
		},
		{
			id: 2,
			emoji: '🔇',
			title: 'Leise',
			description: 'Wenn du „Leise“ auswählst, bekommen alle Kommilitonen den Raum als belegt angezeigt. Sie dürfen allerdings mit zu dir kommen, wenn sie leise sind.',
			commentRequired: false,
			checkinAllowed: true
		},
		{
			id: 3,
			emoji: '🤓',
			title: 'Tutorium',
			description: 'Indem du „Tuorium“ auswählst kannst du Kommilitonen darauf aufmerksam machen, dass hier ein privates Tutorium stattfindet.',
			commentRequired: true,
			checkinAllowed: true
		}
	];

	return config;
}