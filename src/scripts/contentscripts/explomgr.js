if($('.formTitle').text().substring(0, 6)=='Global') {
	
$('form #stdArray td:nth-child(4)').append(
	$('<input maxlength="4" size="4">').
		keydown(function (event) {
			if (event.which == 13) {
				event.preventDefault();
			}
		}).
		on('input', function () {
			$(this).closest('table').find(':not(#stdArray) input[type="text"]').val($(this).val());
		})
);

Hyperiums7.getPlanetInfo().done(function (planets) {
	$.each(planets, function (_, planet) {
		var plDetails = $('[href="Planetprod?planetid=' + planet.id + '"]').closest('tr').children('td');
		plDetails.eq(2).append('<br>Population size: ',
				numeral(planet.pop).format('0,0'), '&nbsp;M');
		var exp = numeral(plDetails.eq(1).find('tr').children('td').eq(1).text());
		var bought = numeral(plDetails.eq(2).find('tr').children('td').eq(1).text()) || 0;
		var opti = Math.floor(numeral(planet.pop)/10) - exp - bought;
		plDetails.eq(3).find('input').attr('placeholder', opti);
	});
});

Hyperiums7.getTradingPartners().done(function (planets) {
	planets.map(function (e) {
		return e.sort(function (a, b) {
			return - a.localeCompare(b);
		});
	});
	planets.sort(function (a, b) {
		return - a[a.length-1].localeCompare(b[b.length-1]);
	});
	var table = $('.stdArray').find('tbody:first');
	var header = table.find('tr:first');
	var a, grnum = 0;
	for(var i=0; i<planets.length; i++) {
		for(var j=0; j<planets[i].length; j++) {
			row = $("a:contains('"+planets[i][j]+"')").closest('tr');
			if(row.text()!='') {
				row.attr('class', 'line'+grnum%2);
				row.insertAfter(header);
			}
		}
		grnum++;
	}
});

}
