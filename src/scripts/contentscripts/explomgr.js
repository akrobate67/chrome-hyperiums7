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
		$('[href="Planetprod?planetid=' + planet.id + '"]').closest('tr').
			children('td').eq(2).append('<br>Population size: ',
				numeral(planet.pop).format('0,0'), '&nbsp;M')
	});
});

