module.exports = function (DataTypes) {
	'use strict';

	return {
		attributes: {
			id: {
				primaryKey: true,
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4
			},
			name_short: {
				type: DataTypes.STRING(6),
				allowNull: false
			},
			name_long: {
				type: DataTypes.STRING(32),
				allowNull: false
			},
			name_infoboard: {
				type: DataTypes.STRING(32),
				allowNull: false
			},
			description: {
				type: DataTypes.STRING(512),
				allowNull: false
			},
			geo_lat: {
				type: DataTypes.DOUBLE,
				allowNull: false
			},
			geo_lng: {
				type: DataTypes.DOUBLE,
				allowNull: false
			}
		},

		publicJSON: function (data) {
			return {
				id: data.id,
				name: {
					short: data.name_short,
					long: data.name_long
				},
				description: data.description,
				geoLocation: {
					lat: data.geo_lat,
					lng: data.geo_lng
				}
			};
		}
	};
};
