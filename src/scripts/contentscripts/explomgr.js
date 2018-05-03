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

}
