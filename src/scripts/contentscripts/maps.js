$('[name="searchplanets"]').keydown(function (event) {
	if (event.which == 13) {
		event.preventDefault();
		$('#searchButton').click();
	}
});

function createEmptyStats(name) {
	return {
		count: 0,
		name: name,

		'Auth.': 0,
		'Demo.': 0,
		'Dict.': 0,
		'Hyp.': 0,

		'Azterk': 0,
		'Human': 0,
		'Xillor': 0,

		'Agro': 0,
		'Minero': 0,
		'Techno': 0
	};
}

var stats = createEmptyStats('Total'),
	tagIndex = {},
	table = $('table.stdArray');

stats.tags = [];
table.find('tr:not(.stdArray)').each(function (_, element) {
	var tr = $(element),
		tds = tr.find('td'),
		planet = {
			name: $.trim(tds.eq(0).text().replace(/^@/, '')),
			tag: tds.eq(1).text(),
			civ: parseInt(tds.eq(3).text()),
			govName: tds.eq(4).text(),
			raceName: tds.eq(5).text(),
			distance: parseInt(tds.eq(6).text()),
			productName: tds.eq(7).text(),
			activity: parseInt(tds.eq(8).text().replace(',', '')) || 0,
			freeCapacity: parseInt(tds.eq(9).text().replace(',', '')) || 0,
			isBlackholed: tr.hasClass('alertLight')
		};

	if (planet.raceName == '') {
		planet.raceName = tds.eq(5).find('img').attr('src').
			replace(/^.*_(.*)\.gif$/, '$1');
	}

	var coords = /^\((-?\d+),(-?\d+)\)$/.exec(tds.eq(2).text());
	if (coords.length) {
		planet.x = parseInt(coords[1]);
		planet.y = parseInt(coords[2]);
	}

	if (!tagIndex[planet.tag]) {
		tagIndex[planet.tag] = stats.tags.push(createEmptyStats(planet.tag)) - 1;
	}

	$.each([
		stats,
		stats.tags[tagIndex[planet.tag]]
	], function(_, stats) {
		stats.count++;
		if (planet.isBlackholed) {
			return;
		}
		stats[planet.govName]++;
		stats[planet.raceName]++;
		stats[planet.productName]++;
		$.each(['civ', 'activity', 'freeCapacity'], function (_, key) {
			if (!stats[key]) {
				stats[key] = {min: Number.MAX_VALUE, max: 0, total: 0, count: 0};
			}
			stats[key].count++;
			stats[key].min = Math.min(stats[key].min, planet[key]);
			stats[key].total += planet[key];
			stats[key].max = Math.max(stats[key].max, planet[key]);
		});
	});
});

var tfoot = $('<tfoot>');
function createStatsTr(stats) {
	return $('<tr>').append([
		$('<td>').text(stats.name),
		$('<td class="hr">').text(stats.count + ' Planet(s)'),
		$('<td class="hc">Min<br>Avg/Total<br>Max</td>'),
		$('<td class="hc">').append([
			stats.civ.min, '<br>',
			numeral(stats.civ.total / stats.count).format('0[.]0'), '<br>',
			stats.civ.max
		]),
		$('<td class="hc">').append([
			stats['Auth.'], ' A<br>',
			stats['Demo.'], ' De<br>',
			stats['Dict.'], ' Di<br>',
			stats['Hyp.'], ' H'
		]),
		$('<td class="hc">').append([
			stats['Azterk'], ' A<br>',
			stats['Human'], ' H<br>',
			stats['Xillor'], ' X<br>'
		]),
		$('<td class="hc">-</td>'),
		$('<td class="hr">').append([
			stats['Agro'], ' A<br>',
			stats['Minero'], ' M<br>',
			stats['Techno'], 'T'
		]),
		$('<td class="hr">').append([
			numeral(stats.activity.min).format('0,0'), '<br>',
			numeral(stats.activity.total / stats.count).format('0,0'), '<br>',
			numeral(stats.activity.max).format('0,0')
		]),
		$('<td class="hr">').append([
			numeral(stats.freeCapacity.min).format('0,0'), '<br>',
			numeral(stats.freeCapacity.total / stats.count).format('0,0'), '/',
			numeral(stats.freeCapacity.total).format('0,0'), '<br>',
			numeral(stats.freeCapacity.max).format('0,0')
		])
	]);
}

$.each([
	stats,
	stats.tags
], function (_, stats) {
	if ($.isArray(stats)) {
		$.each(stats, function (i, stats) {
			tfoot.append(createStatsTr(stats).addClass('line' + (++i % 2)));
		});
	} else {
		tfoot.append(createStatsTr(stats).addClass('stdArray'));
	}
});

table.append(tfoot);

