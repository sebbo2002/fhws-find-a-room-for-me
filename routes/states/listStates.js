module.exports = function (g) {
	'use strict';

	return {
		type: 'get',
		path: '/states',
		sessionRequired: false,

		code: function (req, res) {
			res.send(
				g.config.states
					.filter(state => state.checkinAllowed)
					.map(state => ({
						id: state.id,
						emoji: state.emoji,
						title: state.title,
						descriptionHeadline: state.descriptionHeadline,
						description: state.description,
						commentRequired: state.commentRequired
					}))
			);
		}
	};
};