(function () {
	if ($('.megaCurrentItem').attr('href') == '/servlet/Maps?maptype=planets_trade') {
		$('[name="searchplanets"]').keydown(function (event) {
			if (event.which == 13) {
				event.preventDefault();
				$('#searchButton').click();
			}
		});

		var planets = Hyperiums7.getPlanetsFromTradingMap(document);

		$('table.stdArray').append(
			$('<tfoot>').append(Hyperiums7.getStatisticsRowsFromPlanets(planets))
		);
	}
})();

