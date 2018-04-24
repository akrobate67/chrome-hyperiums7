$.getScript('/js/overlibmws.js').done(function () {
	var numLoading = 2, planets;

	Hyperiums7.getTradingOverview().done(function (planets) {
		numLoading--;
		showStatisticsIfComplete(planets);
	});

	Hyperiums7.getGaRates().done(function (planets) {
		numLoading--;
		showStatisticsIfComplete(planets);
	});

	function showStatisticsIfComplete(addPlanets) {
		if (planets) {
			$.each(addPlanets, function (_, planet) {
				if (!planet) {
					return;
				}
				if (planets[planet.id]) {
					$.each(planet, function (key, value) {
						planets[planet.id][key] = value;
					});
				} else {
					planets[planet.id] = planet;
				}
			});
		} else {
			planets = addPlanets;
		}

		if (numLoading > 0) {
			return;
		}

		var container, stats = {
			numPlanets: 0,
			governments: {},
			products: {},
			races: {},
			gaRate: {}
		};

		$('.planet').
			each(function (_, element) {
				stats.numPlanets++;
				element = $(element);
				var detailsTr = element.closest('tr').next(),
				details = detailsTr.find('.prod0,.prod1,.prod2,.bold,b'),
				planetId = parseFloat(element.attr('href').replace(/[^\d]+/g, '')),
				raceName = details.eq(2).text(),
				govName = details.eq(1).text().replace(/ \(\d\)$/, ''),
				productName = details.eq(0).text(),
				popAmount = parseFloat(details.eq(3).text()),
				civLevel = parseInt(details.eq(4).text());

				$.each({
					governments: govName,
					products: productName,
					races: raceName
				}, function (key, value) {
					if (stats[key][value]) {
						stats[key][value]++;
					} else {
						stats[key][value] = 1;
					}
				});

				$.each({
					pop: popAmount,
					civ: civLevel
				}, function (key, value) {
					if (!stats[key]) {
						stats[key] = {min: Number.MAX_VALUE, max: 0, total: 0};
					}
					stats[key].min = Math.min(stats[key].min, value);
					stats[key].max = Math.max(stats[key].max, value);
					stats[key].total += value;
				});

				if (planets[planetId]) {
					if (stats.gaRate[raceName]) {
						stats.gaRate[raceName] += planets[planetId].gaRate || 0;
					} else {
						stats.gaRate[raceName] = planets[planetId].gaRate || 0;
					}
				}

				/*Hyperiums7.getPlanetIdInfluence(planetId).done(function (influence) {
					var wtr = planets[planetId].wtr,
						afterWtr = influence * (1 - wtr / 100);

					detailsTr.find('.civ').append($('<tr>').append(
						$('<td colspan="4">').append([
							'Influence value: ',
							$('<span class="highlight">').
								text(numeral(afterWtr).format('0,0')).
								mouseover(function () {
									overlib(
										numeral(influence).format('0,0') + ' - WTR ' +
										wtr + '% = ' + numeral(afterWtr).format('0,0')
									);
								}).
								mouseout(function () {
									nd();
								}),
							' (after WTR)'
						])
					));
				});*/
			}).
			closest('table.hl').closest('td').append(container = $('<center>').append([
				'<hr>',
				$('<b>').text('Total: ' + stats.numPlanets + ' controlled planets')
			]));

		container.append($('<table>').append(
			(function (tr) {
				$.each({
					governments: 'Government&nbsp;system',
					products: 'Production&nbsp;type',
					races: 'Population&nbsp;race'
				}, function (key, caption) {
					var table = $('<table>').append($('<caption>').html(caption));

					$.each(Hyperiums7[key], function (i, name) {
						var value = stats[key][name];
						table.append($('<tr>').append([
							$('<th>').text(name),
							$('<td class="hr">').text(value ? value : '-')
						]).addClass('line' + (++i % 2)));
					});

					tr.append($('<td style="padding-right:1em">').append(table));
				});

				var table = $('<table>').append([
					$('<caption>').html('GA&nbsp;Rates'),
					'<thead><tr class="stdArray"><th>Race</th><th class="hr">#</th><th></th><th class="hr">AvgP</th></tr></thead>'
				]);
				$.each(Hyperiums7.races, function (raceId, raceName) {
					table.append($('<tr>').append([
						$('<th>').text(raceName),
						$('<td class="hr">').text(stats.gaRate[raceName] ?
							numeral(stats.gaRate[raceName]).format('0,0.0') :
							'-'),
						'<td>/</td>',
						$('<td class="hr">').text(stats.gaRate[raceName] ?
							numeral(stats.gaRate[raceName] * Hyperiums7.groundAvgP[raceId]).format('0,0.0a') :
							'-')
					]).addClass('line' + (++raceId % 2)));
				});
				tr.append($('<td style="padding-right:1em">').append(table));

				$.each({
					pop: 'Population&nbsp;size',
					civ: 'Civilization&nbsp;level'
				}, function (key, caption) {
					var table;
					tr.append($('<td style="padding-right:1em">').append(
						table = $('<table>').append([
							$('<caption>').html(caption),
							$('<tr class="line1"><th>Min.</th>').append($('<td class="hr">').text(
								numeral(stats[key].min).format('0,0[.]0')
							)),
							$('<tr class="line0"><th>Avg.</th>').append($('<td class="hr">').text(
								numeral(stats[key].total / stats.numPlanets).format('0,0[.]0')
							)),
							$('<tr class="line1"><th>Max.</th>').append($('<td class="hr">').text(
								numeral(stats[key].max).format('0,0[.]0')
							))
						])
					));
					if (key == 'pop') {
						table.append(
							$('<tr class="line0"><th>Total</th>').append($('<td class="hr">').text(
								numeral(stats[key].total).format('0,0[.]0')
							))
						);
					}
				});

				return tr;
			})($('<tr class="vt">'))
		));
	}
	});

