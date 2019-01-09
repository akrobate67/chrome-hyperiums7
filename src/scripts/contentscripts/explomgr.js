if($('.formTitle').text().substring(0, 6)=='Global') {
	
$('form #stdArray td:nth-child(4)').text('').append(
	$('<input maxlength="4" size="4">').
		keydown(function (event) {
			if (event.which == 13) {
				event.preventDefault();
			}
		}).
		on('input', function () {
			$(this).closest('table').find(':not(#stdArray) input[type="text"]').val($(this).val());
		})
).append(
	$('<input type="button" value="Max">').
		on('click', function () {	
			$(this).closest('table').find(':not(#stdArray) tr').each(function() {
					$(this).find('input[type="text"]').val($(this).find('input[name="maxexp"]').val());
			});	
		})
);

Hyperiums7.getPlanetInfo().done(function (planets) {
	var act = [];
	$.each(planets, function (_, planet) {
		act.push([planet.id, planet.activity]);
		var plDetails = $('[href="Planetprod?planetid=' + planet.id + '"]').closest('tr').children('td');
		plDetails.eq(2).append('<br>Population size: ',
				numeral(planet.pop).format('0,0'), '&nbsp;M');
		var exp = numeral(plDetails.eq(1).find('tr').children('td').eq(1).text());
		var bought = numeral(plDetails.eq(2).find('tr').children('td').eq(1).text()) || 0;
		var opti = Math.floor(numeral(planet.pop)/10) - exp - bought;
		plDetails.eq(3).find('input').attr('placeholder', opti);
	});
	act.sort(function (a, b) {
		return numeral(b[1]) - numeral(a[1]);
	});
	for(var i=0;i<10&&i<act.length;i++) {
		$('[href="Planetprod?planetid=' + act[i][0] + '"]').attr('class', 'std prod1');
	}


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
	var a, grnum = 0, exp, max = 20, one;
	for(var i=0; i<planets.length; i++) {
		if(planets[i]!=null) {
			exp = 1000;
			for(var j=0; j<planets[i].length; j++) {
				val = $("a:contains('"+planets[i][j]+"')").closest('tr').children('td').eq(3).children('input').eq(0).attr('placeholder');				
				if(val && numeral(val) < exp) exp = numeral(val);
			}
			if(exp>max) exp = max;
			if(exp<0) exp = 0;
			if(planets[i].length>2 && exp!=max) exp = 0;
			one = false;
			for(var j=0; j<planets[i].length; j++) {
				row = $("a:contains('"+planets[i][j]+"')").closest('tr');
				if(row.text()!='') {
					row.children('td').eq(3).append(
						$('<input type="hidden" name="maxexp" value="'+exp+'">')
					);
					row.attr('class', 'line'+grnum%2);
					row.insertAfter(header);
					one = true;
				}
			}
			if(one) grnum++;
		}
	}
});

});


}
