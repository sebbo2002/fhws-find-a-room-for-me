module.exports = function (DataTypes) {
	'use strict';

	return {
		attributes: {
			id: {
				primaryKey: true,
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4
			},
			state: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			title: {
				type: DataTypes.STRING(64),
				allowNull: true
			},
			description: {
				type: DataTypes.STRING(256),
				allowNull: true
			},
			course: {
				type: DataTypes.STRING(8),
				allowNull: true
			},
			lecturer: {
				type: DataTypes.STRING(64),
				allowNull: true
			},
			from: {
				type: DataTypes.DATE,
				allowNull: false
			},
			till: {
				type: DataTypes.DATE,
				allowNull: false
			},
			verified_till: {
				type: DataTypes.DATE,
				allowNull: true
			}
		},

		publicJSON: function (data) {
			return {
				id: data.id,
				title: data.title,
				description: data.description,
				course: data.course,
				lecturer: data.lecturer,
				from: data.from,
				till: data.till
			};
		}
	};
};
