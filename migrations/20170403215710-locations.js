'use strict';

const async = require('async');

module.exports = {
	up: function (g) {
		return g.models.location.create({
			name_short: 'SHL',
			name_long: 'Sanderheinrichsleitenweg',
			name_infoboard: 'SHL',
			description: 'Fakultäten Gestaltung (FG) sowie Informatik und Wirtschaftsinformatik (FIW), Studierendenvertretung und weitere',
			geo_lat: 49.777118,
			geo_lng: 9.962518
		}).then(function() {
			return g.models.location.create({
				name_short: 'RöRi',
				name_long: 'Röntgenring',
				name_infoboard: 'RöRi',
				description: 'Studiengänge Kunststoff- und Elastomertechnik, Vermessung und Geoinformatik, Architektur sowie Bauingenieurwesen, Zentralverwaltung',
				geo_lat: 49.7999549,
				geo_lng: 9.9302398
			});
		}).then(function() {
			return g.models.location.create({
				name_short: 'Münz',
				name_long: 'Münzstraße / Sanderring',
				name_infoboard: 'WISO',
				description: 'Hochschulleitung, Bibliothek, Zentralverwaltung, Studiengang Betriebswirtschaft und Studiengang Medienmanagement, Fakultät Angewandte Natur- und Geisteswissenschaften, Zentrales Hörsaalgebäude der Fakultäten Wirtschaftswissenschaften (FWiWi) und Angewandte Sozialwissenschaften (FAS), Studienberatung, Studierendenvertretung, Hochschulmedienzentrum (HMZ) und weitere',
				geo_lat: 49.7871884,
				geo_lng: 9.9303223
			});
		}).then(function() {
			return g.models.location.create({
				name_short: 'FRI',
				name_long: 'Friedrichstraße',
				name_infoboard: 'FRI',
				description: 'Studiengänge Betriebswirtschaft und Medienmanagement, Zentralverwaltung',
				geo_lat: 49.796466,
				geo_lng: 9.913211
			});
		}).then(function() {
			return g.models.location.create({
				name_short: 'Münz19',
				name_long: 'Münzstraße 19',
				name_infoboard: 'Münz19',
				description: 'Hochschulservice Internationales (HSIN), IT Service Center (ITSC), Institut für angewandte Logistik (IAL), Masterstudiengang Fachjournalismus und Unternehmenskommunikation, Studiengänge Pflege- und Gesundheitsmanagement (Pavillon 1)',
				geo_lat: 49.787422,
				geo_lng: 9.933672
			});
		}).then(function() {
			return g.models.location.create({
				name_short: 'CAMP1',
				name_long: 'Campus I',
				name_infoboard: 'Campus 1',
				description: 'Zentralverwaltung, Fakultäten Angewandte Natur- und Geisteswissenschaften (FANG), Elektrotechnik (FE), Maschinenbau (FM), Wirtschaftsingenieurwesen (FWI), Labore, Studierendenvertretung und weiter',
				geo_lat: 50.044893,
				geo_lng: 10.210169
			});
		}).then(function() {
			return g.models.location.create({
				name_short: 'CAMP2',
				name_long: 'Campus II',
				name_infoboard: 'Campus 2',
				description: 'Bachelorstudiengang Logistik, Hörsäle und weitere',
				geo_lat: 50.045477,
				geo_lng: 10.220840
			});
		});
	},

	down: function (g, sequelize) {
		return sequelize.location.sync({force: true});
	}
};
