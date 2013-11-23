$.getScript('/js/overlibmws.js').done(function () {
	var cache = {}, jqXHR;
	$('.polMapZone').
		mouseover(function() {
			var url = $(this).find('a').attr('href');
			if (cache[url]) {
				overlib(cache[url]);
			} else {
				overlib('Loading...');
				jqXHR = $.ajax(url).done(function (data) {
					var planets = Hyperiums7.getPlanetsFromTradingMap(data),
						rows = Hyperiums7.getStatisticsRowsFromPlanets(planets);

					rows.unshift($('<tr class="stdArray">').append([
						'<td>Tag</td>',
						'<td># Planets</td>',
						'<td></td>', // coords
						'<td>Civ.</td>',
						'<td>Gov.</td>',
						'<td>Race</td>',
						'<td></td>', // distance
						'<td>Product</td>',
						'<td>Activity</td>',
						'<td>Avail.<br>capacity</td>'
					]));

					var table = $('<table class="stdArray">').
						css('white-space', 'nowrap').
						append($('<tbody>').append(rows));

					table.find('td').css('font-size', 'smaller');
					cache[url] = table[0].outerHTML;
					overlib(cache[url]);
				});
			}
		}).
		mouseout(function () {
			jqXHR.abort();
			nd();
		});
});

