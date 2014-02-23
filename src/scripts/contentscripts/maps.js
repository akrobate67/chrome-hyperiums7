(function () {
	if ($('.megaCurrentItem').attr('href') == '/servlet/Maps?maptype=planets_trade') {
		$('[name="searchplanets"]').keydown(function (event) {
			if (event.which == 13) {
				event.preventDefault();
				$('#searchButton').click();
			}
		});

		$('table.stdArray tr:not(.stdArray)').each(function (_, element) {
			var tr = $(element);
			var planet = Hyperiums7.getPlanetFromTradingMapRow(tr);
			tr.find('a[href^="Maps"]').after(' ', $('<a>').attr({
					href: 'http://www.beka.fr/hyperiums/index.php?page=histo&planet=' +
						encodeURIComponent(planet.name) + '&selectgame=Hyperiums7',
					target: '_blank'
				}).
				append('<img src="/themes/theme1/misc/activity.png" alt="History" title="History"/>'));
		});

		var planets = Hyperiums7.getPlanetsFromTradingMap(document);

		$('table.stdArray').append(
			$('<tfoot>').append(Hyperiums7.getStatisticsRowsFromPlanets(planets))
		);

		var systems = [], minX, maxX, minY, maxY;
		$.each(planets, function (_, planet) {
			if (!systems[planet.x]) {
				systems[planet.x] = [];
			}
			if (!systems[planet.x][planet.y]) {
				systems[planet.x][planet.y] = [];
			}
			systems[planet.x][planet.y].push(planet);
			minX = isNaN(minX) ? planet.x : Math.min(minX, planet.x);
			maxX = isNaN(maxX) ? planet.x : Math.max(maxX, planet.x);
			minY = isNaN(minY) ? planet.y : Math.min(minY, planet.y);
			maxY = isNaN(maxY) ? planet.y : Math.max(maxY, planet.y);
		});

		var table = $('<table class="tinytext">'),
			x, y, tr, td;
		for (y = maxY; y >= minY; y--) {
			tr = $('<tr class="vt">');
			for (x = minX; x <= maxX; x++) {
				td = $('<td class="tacMapZone hc">').text('(' + x + ','+  y + ')');
				if (systems[x] && systems[x][y] && systems[x][y].length) {
					td.append((function (planets) {
						var table = $('<table class="array">');
						$.each(planets, function (_, planet) {
							var nameElements = [
								$('<a>').attr({
									href: '/servlet/Planetfloats?planetid=' + planet.id,
									target: '_blank'
								})
							];

							if (planet.isOwn) {
								nameElements[0].append($('<b>').text(planet.name));
							} else {
								nameElements[0].text(planet.name);
							}

							if (planet.isBlackholed) {
								nameElements.unshift(
									'<img src="/themes/theme1/misc/BH.gif" title="Destroyed by blackhole" style="height:1em"> '
								);
							} else if (planet.isDoomed) {
								nameElements.unshift(
									$('<img src="/themes/theme1/misc/death1.gif" style="height:1em">').
										attr('title', 'Time before annihilation: ' + planet.daysBeforeAnnihilation + ' day(s)'),
									' '
								);
							}

							var tr = $('<tr>').append([
								$('<td class="hl" style="white-space:nowrap">').append(nameElements),
								$('<td>').
									addClass(planet.govName.replace(/\.$/, '')).
									attr({title: planet.govName}).
									text(planet.govName.substr(0, 1)),
								$('<td class="hc">').
									text(planet.tag == '-' ? '[]' : planet.tag),
								$('<td class="hr info">').
									text(planet.civ),
								$('<td>').
									addClass(planet.raceName).
									attr({title: planet.raceName}).
									text(planet.raceName.substr(0, 1)),
								$('<td>').
									addClass(planet.productName).
									attr({title: planet.productName}).
									text(planet.productName.substr(0, 1)),
								$('<td class="hr info">').
									text(numeral(planet.activity).format('0,0'))
							]);
							if (planet.isBlackholed) {
								tr.addClass('alertLight blackholed');
							} else if (planet.isDoomed) {
								tr.addClass('doomed');
							}
							table.append(tr);
						});

						return table;
					})(systems[x][y]));
				}
				tr.append(td);
			}
			table.append(tr);
		}

		table.
			wrap('<div class="tabbertab" title="Map">').
			parent().
			prepend($('<p>').append([
				$('<label>').append([
					$('<input type="checkbox" checked="checked">').change(function () {
						if ($(this).is(':checked')) {
							$('.blackholed').show();
						} else {
							$('.blackholed').hide();
						}
					}),
					' Show blackholed planets'
				]),
				' ',
				$('<label>').append([
					$('<input type="checkbox" checked="checked">').change(function () {
						if ($(this).is(':checked')) {
							$('.doomed').show();
						} else {
							$('.doomed').hide();
						}
					}),
					' Show doomed planets'
				])
			]));

		$('table.stdArray').
			wrap('<div class="tabbertab" title="Table">').
			parent().
			before('<br>').
			wrap('<div class="tabber">').
			parent().
			append(table.parent());

		$('body').append([
			'<link href="/themes/theme1/css/tabber.css" rel="stylesheet" type="text/css"/>',
			'<script type="text/javascript" src="/js/tabber.js"></script>'
		]);
		tabberAutomatic();
	}
})();

