var container, stats = {
	numPlanets: 0,
	governments: {},
	products: {},
	races: {}
};

$('.planet').
	each(function (_, element) {
		stats.numPlanets++;
		element = $(element);
		var details = element.closest('tr').next().find('.highlight, .civ b');
		$.each({
			governments: details.eq(0).text(),
			products: details.eq(1).text(),
			races: details.eq(2).text()
		}, function (key, value) {
			if (stats[key][value]) {
				stats[key][value]++;
			} else {
				stats[key][value] = 1;
			}
		});
		$.each({
			pop: parseFloat(details.eq(3).text()),
			civ: parseInt(details.eq(4).text())
		}, function (key, value) {
			if (!stats[key]) {
				stats[key] = {min: Number.MAX_VALUE, max: 0, total: 0};
			}
			stats[key].min = Math.min(stats[key].min, value);
			stats[key].max = Math.max(stats[key].max, value);
			stats[key].total += value;
		});
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

		$.each({
			pop: 'Population&nbsp;size',
			civ: 'Civilization&nbsp;level'
		}, function (key, caption) {
			tr.append($('<td style="padding-right:1em">').append(
				$('<table>').append([
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
		});

		return tr;
	})($('<tr class="vt">'))
));

