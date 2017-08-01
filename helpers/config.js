module.exports = function () {
	'use strict';

	const config = {};

	config.port = process.env.PORT || 8080;
	config.database = process.env.DB || 'mysql://127.0.0.1:3306/find-me-a-room';
	config.infoBoardURL = process.env.INFOBOARD_URL || 'https://infoboard.fhws.de/';
	config.pushServerKey = process.env.FCM_SERVER_KEY || null;
	config.ravenDSN = process.env.RAVEN_DSN || null;

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
			descriptionHeadline: 'Was bedeutet „Privat“?',
			description: 'Wenn du „Privat“ auswählst, bekommen alle Kommilitonen den Raum als belegt angezeigt.',
			commentRequired: false,
			checkinAllowed: true
		},
		{
			id: 2,
			emoji: '🔇',
			title: 'Leise',
			descriptionHeadline: '„Leise“?',
			description: 'Wenn du „Leise“ auswählst, bekommen alle Kommilitonen den Raum als belegt angezeigt. Sie dürfen allerdings mit zu Dir kommen, wenn sie leise sind.',
			commentRequired: false,
			checkinAllowed: true
		},
		{
			id: 3,
			emoji: '🤓',
			title: 'Tutorium',
			descriptionHeadline: 'Wann wähle ich „Tutorium“?',
			description: 'Indem du „Tutorium“ auswählst kannst du Kommilitonen darauf aufmerksam machen, dass hier ein privates Tutorium stattfindet.',
			commentRequired: true,
			checkinAllowed: true
		}
	];

	return config;
}