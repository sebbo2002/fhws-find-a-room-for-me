module.exports = function (DataTypes) {
	'use strict';

	return {
		attributes: {
			id: {
				primaryKey: true,
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4
			},
			secret: {
				type: DataTypes.STRING(60)
			},
			user_agent: {
				type: DataTypes.STRING(256),
				allowNull: true
			},
			system_version: {
				type: DataTypes.STRING(256),
				allowNull: true
			},
			device_name: {
				type: DataTypes.STRING(256),
				allowNull: true
			},
			push_token: {
				type: DataTypes.STRING(256)
			},
			last_usage: {
				type: DataTypes.DATE,
				allowNull: true
			}
		},

		publicJSON: function (data) {
			return {
				id: data.id,
				systemVersion: data.system_version,
				deviceName: data.device_name,
				pushToken: data.push_token
			};
		}
	};
};
