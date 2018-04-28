$('input[name="receiverid"]').autocomplete({
	autoFocus: true,
	source: function (request, sendResponse) {
		switch ($('input[name="totype"]:checked').val() || 'Player') {
		case 'Planet':
			Hyperiums7.searchPlanets(request.term).
				done(function (planets) {
					var names = [];
					$.each(planets, function (_, planet) {
						names.push(planet.name);
					});
					sendResponse(names);
				}).
				fail(function () {
					sendResponse([]);
				});
			break;
		case 'Player':
			Hyperiums7.getContacts().
				done(function (players) {
					var names = [],
						re = new RegExp('^' + $.ui.autocomplete.escapeRegex(request.term), 'i');
					$.each(players, function (_, player) {
						if (re.test(player.name)) {
							names.push(player.name);
						}
					});
					sendResponse(names);
				}).
				fail(function () {
					sendResponse([]);
				});
			break;
		default:
			sendResponse([]);
		}
	}
});

