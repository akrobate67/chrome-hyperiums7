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

var totalIncome = parseFloat($('.line1 .hr').text().replace(/,/g, '')),
	upkeepRow = $('.line0, .line1').last(),
	upkeep = Math.abs(parseFloat(upkeepRow.find('.hr').text().replace(/,/g, '')));

upkeepRow.find('td:first-child').append(
	$('<small>').text(' (' + numeral(upkeep / totalIncome).format('0[.]0%') + ')')
);

var totalExploitationsIncome = 0;
$('table[width="340"] > tbody > tr:first-child > .hr').each(function (_, element) {
	totalExploitationsIncome += parseFloat($(element).text().replace(/,/g, '')) || 0;
});

var totalCaptivityIncome = 0;
$('table[width="340"] > tbody > tr > .hr.hlight').each(function (_, element) {
	totalCaptivityIncome += parseFloat($(element).text().replace(/,/g, '')) || 0;
});

var totalGrossIncome = totalExploitationsIncome + totalCaptivityIncome;

$('.line1').eq(0).before([
	$('<tr class="line1">').append([
		'<td>Total gross income</td>',
		$('<td class="hr">').text(numeral(totalGrossIncome).format('0,0'))
	]), 
	$('<tr>').append([
		$('<td class="tinytext" style="padding-left:2em">').append([
			'Total income from exploitations',
			$('<small>').text(' (' +
				numeral(totalExploitationsIncome / totalGrossIncome).format('0[.]0%') +
			')')
		]),
		$('<td class="hr tinytext">').text(numeral(totalExploitationsIncome).format('0,0'))
	]),
	$('<tr>').append([
		$('<td class="tinytext" style="padding-left:2em">').append([
			'Total income from captive planets',
			$('<small>').text(' (' +
				numeral(totalCaptivityIncome / totalGrossIncome).format('0[.]0%') +
			')')
		]),
		$('<td class="hr tinytext">').text(numeral(totalCaptivityIncome).format('0,0'))
	]),
]);


