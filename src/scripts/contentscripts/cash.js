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

var totalIncome = parseFloat($('.line0 .hr').text().replace(/,/g, ''));

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

var totalExploitationsIncome = 0;
$('table[width="340"] > tbody > tr:first-child > .hr').each(function (_, element) {
	totalExploitationsIncome += parseFloat($(element).text().replace(/,/g, '')) || 0;
});

var totalCaptivityIncome = 0;
$('table[width="340"] > tbody > tr > .hr.hlight').each(function (_, element) {
	totalCaptivityIncome += parseFloat($(element).text().replace(/,/g, '')) || 0;
});

var totalGrossIncome = totalExploitationsIncome + totalCaptivityIncome;

$('.line0').eq(0).before([
	$('<tr class="line0">').append([
		'<td>Total gross income</td>',
		$('<td class="hr">').text(numeral(totalGrossIncome).format('0,0'))
	]), 
	$('<tr class="line1">').append([
		$('<td class="tinytext" style="padding-left:2em">').append([
			'Total income from exploitations',
			$('<small>').text(' (' +
				numeral(totalExploitationsIncome / totalGrossIncome).format('0[.]0%') +
			')')
		]),
		$('<td class="hr tinytext">').text(numeral(totalExploitationsIncome).format('0,0'))
	]),
	$('<tr class="line1">').append([
		$('<td class="tinytext" style="padding-left:2em">').append([
			'Total income from captive planets',
			$('<small>').text(' (' +
				numeral(totalCaptivityIncome / totalGrossIncome).format('0[.]0%') +
			')')
		]),
		$('<td class="hr tinytext">').text(numeral(totalCaptivityIncome).format('0,0'))
	]),
]);


