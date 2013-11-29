$('.br_own').closest('table').each(function (_, table) {
	table = $(table);
	var spaceAvgP = {}, groundAvgP = {}, avgRaceId = 4;
	var lastTr = table.find('tr.line0, tr.line1').
		each(function (_, tr) {
			tr = $(tr);
			var tds = tr.find('td'),
				unitName = $.trim(tds.eq(0).text()),
				unitId = Hyperiums7.units.indexOf(unitName),
				numbers = {
					own: {
						initial: parseFloat(tds.eq(1).text()) || 0,
						lost: parseFloat(tds.eq(2).text()) || 0
					},
					defending: {
						initial: parseFloat(tds.eq(3).text()) || 0,
						lost: parseFloat(tds.eq(4).text()) || 0
					},
					attacking: {
						initial: parseFloat(tds.eq(5).text()) || 0,
						lost: parseFloat(tds.eq(6).text()) || 0
					}
				};
			$.each(numbers, function (side, numbers) {
				if (!spaceAvgP[side]) {
					spaceAvgP[side] = {initial: 0, lost: 0};
				}
				if (!groundAvgP[side]) {
					groundAvgP[side] = {initial: 0, lost: 0};
				}
				if (Hyperiums7.spaceAvgP[unitId][avgRaceId] == 0) {
					groundAvgP[side].initial += numbers.initial *
						Hyperiums7.groundAvgP[avgRaceId];
					groundAvgP[side].lost += numbers.lost *
						Hyperiums7.groundAvgP[avgRaceId];
				} else {
					spaceAvgP[side].initial += numbers.initial *
						Hyperiums7.spaceAvgP[unitId][avgRaceId];
					spaceAvgP[side].lost += numbers.lost *
					Hyperiums7.spaceAvgP[unitId][avgRaceId];
				}
			});
		}).
		last();
		
		var i = lastTr.hasClass('line1') ? 1 : 0;
		lastTr.after([
			$('<tr>').addClass('line' + (++i%2)).append([
				'<td class="tinytext">Space AvgP ~</td>',
				$('<td class="hr tinytext br_colStart">').text(numeral(spaceAvgP.own.initial).format('0[.]0a')),
				$('<td class="hr tinytext">').text(numeral(spaceAvgP.own.lost).format('0[.]0a')),
				$('<td class="hr tinytext br_colStart">').text(numeral(spaceAvgP.defending.initial).format('0[.]0a')),
				$('<td class="hr tinytext">').text(numeral(spaceAvgP.defending.lost).format('0[.]0a')),
				$('<td class="hr tinytext br_colStart">').text(numeral(spaceAvgP.attacking.initial).format('0[.]0a')),
				$('<td class="hr tinytext br_lastCol">').text(numeral(spaceAvgP.attacking.lost).format('0[.]0a')),
			]),
			$('<tr>').addClass('line' + (++i%2)).append([
				'<td class="tinytext">Ground AvgP ~</td>',
				$('<td class="hr tinytext br_colStart">').text(numeral(groundAvgP.own.initial).format('0[.]0a')),
				$('<td class="hr tinytext">').text(numeral(groundAvgP.own.lost).format('0[.]0a')),
				$('<td class="hr tinytext br_colStart">').text(numeral(groundAvgP.defending.initial).format('0[.]0a')),
				$('<td class="hr tinytext">').text(numeral(groundAvgP.defending.lost).format('0[.]0a')),
				$('<td class="hr tinytext br_colStart">').text(numeral(groundAvgP.attacking.initial).format('0[.]0a')),
				$('<td class="hr tinytext br_lastCol">').text(numeral(groundAvgP.attacking.lost).format('0[.]0a')),
			])
		]);
});

