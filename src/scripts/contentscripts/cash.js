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

