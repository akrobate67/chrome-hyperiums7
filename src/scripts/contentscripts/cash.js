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
	upkeep = Math.abs(parseFloat($('.line0 .hr').text().replace(/,/g, '')));

$('.line0 td:first-child').append(
	$('<small>').text(' (' + numeral(upkeep / totalIncome).format('0[.]0%') + ')')
);

