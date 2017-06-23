module.exports = function (DataTypes) {
	'use strict';

	return {
		attributes: {
			id: {
				primaryKey: true,
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4
			},
			name: {
				type: DataTypes.STRING(32),
				allowNull: false
			},
			infoboard_name: {
				type: DataTypes.STRING(64),
				allowNull: false
			},
			inventory_projectors: {
				type: DataTypes.INTEGER,
				allowNull: true
			},
			inventory_speaker_desk_displays: {
				type: DataTypes.INTEGER,
				allowNull: true
			},
			inventory_speaker_floor_displays: {
				type: DataTypes.INTEGER,
				allowNull: true
			},
			inventory_seats: {
				type: DataTypes.INTEGER,
				allowNull: true
			},
			inventory_whiteboards: {
				type: DataTypes.INTEGER,
				allowNull: true
			},
			inventory_sound: {
				type: DataTypes.BOOLEAN,
				allowNull: true
			},
			visible: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: true
			}
		},

		publicJSON: function (data) {
			return {
				id: data.id,
				name: data.name,
				inventory: {
					projectors: data.inventory_projectors,
					speakerDeskDisplay: data.inventory_speaker_desk_displays,
					speakerFloorDisplays: data.inventory_speaker_floor_displays,
					seats: data.inventory_seats,
					whiteboards: data.inventory_whiteboards,
					sound: data.inventory_sound
				}
			};
		}
	};
};
