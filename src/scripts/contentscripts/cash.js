var planetNames = [], planetNameElements = {};
$('.hlight b').each(function (_, element) {
	element = $(element)
	var name = element.text();
	planetNames.push(name);
	planetNameElements[name] = element;
});

Hyperiums7.searchPlanets(planetNames.join(',')).done(function (planets) {
	$.each(planets, function (_, planet) {
		if (planetNameElements[planet.name]) {
			planetNameElements[planet.name].wrap(
				$('<a>').attr('href', Hyperiums7.getServletUrl(
					'Planetspy?backurl=Cash&planetid=' + planet.id
				))
			);
		}
	});
});

$('.line1').removeClass('line1').addClass('line0');

var totalIncome = parseFloat($('table.cashArray tr td.hr').text().replace(/,/g, ''));

var trFleets = $('table.cashArray tr.line0').eq(1);
trFleets.find('td').eq(0).append(" ("+numeral(Math.abs(parseFloat(trFleets.find('td').eq(1).text().replace(/,/g, '')))/ totalIncome).format('0[.]0%')+")");
var trFleets = $('table.cashArray tr.line0').eq(2);
trFleets.find('td').eq(0).append(" ("+numeral(Math.abs(parseFloat(trFleets.find('td').eq(1).text().replace(/,/g, '')))/ totalIncome).format('0[.]0%')+")");



Hyperiums7.getFleetsUpkeep().done(function (upkeep) {
	var upkeepRow = $('.line0').last(),
		totalUpkeep = Math.abs(parseFloat(upkeepRow.find('.hr').text().replace(/,/g, ''))),
		maxNumDeployed = $('.bgLine').length * 5,
		deployedCostsTh;

	upkeep.deployedCosts = totalUpkeep - upkeep.unitCosts;
	upkeepRow.
		after([
			$('<tr class="line1">').append([
				$('<td class="tinytext" style="padding-left:2em">').append([
					'Cost for fleets &amp; armies',
					$('<small>').text(' (' +
						numeral(upkeep.unitCosts / totalIncome).format('0[.]0%') +
					')')
				]),
				$('<td class="hr tinytext">').text('-' + numeral(upkeep.unitCosts).format('0,0'))
			]),
			$('<tr class="line1">').append([
				deployedCostsTh = $('<td class="tinytext" style="padding-left:2em">'),
				$('<td class="hr tinytext">').text('-' + numeral(upkeep.deployedCosts).format('0,0'))
			])
		]).
		find('td:first-child').append(
			$('<small>').text(' (' + numeral(totalUpkeep / totalIncome).format('0[.]0%') + ')')
		);

		deployedCostsTh.append([
			'Cost for deployed fleets &amp; armies (',
			numeral(Math.min(upkeep.numDeployed, maxNumDeployed)).format('0,0')
		]);

		if (upkeep.numDeployed > maxNumDeployed) {
			deployedCostsTh.append([
				'+',
				$('<span class="alertLight">').text(
					numeral(upkeep.numDeployed - maxNumDeployed).format('0,0')
				)
			]);
		} else {
			deployedCostsTh.append([
				'/',
				numeral(maxNumDeployed).format('0,0')
			]);
		}

		deployedCostsTh.append([
			') ',
			$('<small>').text('(' +
				numeral(upkeep.deployedCosts / totalIncome).format('0[.]0%') +
			')')
		]);
});


$('.line0').eq(0).before(function () {
	var totals = {}, totalGrossIncome = 0, rows = [];
	$('table[width="340"] > tbody > tr').each(function (_, row) {
		var tds = $(row).children('td'),
			type = tds.eq(0).text(),
			value = numeral().unformat(tds.eq(1).text()) || 0;

		if (type == '') {
			return;
		}

		if (type.indexOf('%') != -1) {
			type = 'Captivity income';
		}

		if (totals[type]) {
			totals[type] += value;
		} else {
			totals[type] = value;
		}

		if (value > 0) {
			totalGrossIncome += value;
		}
	});

/*	rows.push($('<tr class="line0">').append([
		'<td>Total gross income</td>',
		$('<td class="hr">').text(numeral(totalGrossIncome).format('0,0'))
	]));
  */
	$.each(totals, function (label, value) {
		if (value) {
			rows.push($('<tr class="line1">').append([
				$('<td class="tinytext" style="padding-left:2em">').
					text(label).
					append($('<small>').text(' (' +
						numeral(Math.abs(value) / totalGrossIncome).format('0[.]0%') +
					')')),
				$('<td class="hr tinytext">').text(numeral(value).format('0,0'))
			]));
		}
	});


	return rows;
});

