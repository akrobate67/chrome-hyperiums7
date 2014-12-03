$(function () {
	var currentStats = {
		timestamp: (new Date).getTime(),
		minPrice: Number.MAX_VALUE,
		maxPrice: 0,
		totalPrice: 0,
		numCredits: 0
	};

	var $table = $('table.stdArray');
	$table.find('.line0, .line1').each(function () {
		var $tds = $(this).children('td');
		var numCredits = numeral().unformat($tds.eq(2).text());
		var price = numeral().unformat($tds.eq(3).text());

		currentStats.minPrice = Math.min(currentStats.minPrice, price);
		currentStats.maxPrice = Math.max(currentStats.maxPrice, price);
		currentStats.totalPrice += price * numCredits;
		currentStats.numCredits += numCredits;
	});

	currentStats.avgPrice = currentStats.totalPrice / currentStats.numCredits;

	$table.prepend(
		$('<tfoot></foot>').append([
			$('<tr></tr>').append([
				'<td></td><td></td><td class="hr">Credits on sale</td>',
				$('<td class="hr"></td>').text(
					numeral(currentStats.numCredits).format('0,0')
				)
			]),
			$('<tr></tr>').append([
				'<td></td><td></td><td class="hr">Average price</td>',
				$('<td class="hr"></td>').text(
					numeral(currentStats.avgPrice).format('0,0')
				)
			])
		])
	);

	chrome.storage.sync.get('creditStats', function (storage) {
		var allStats = storage.creditStats;
		var lastStats = allStats[allStats.length - 1];
		if (lastStats && currentStats.timestamp - lastStats.timestamp <= 1800000) {
			allStats[allStats.length - 1] = currentStats;
		} else {
			allStats.push(currentStats);
		}
		chrome.storage.sync.set({ creditStats: allStats });

		var data = {
			labels: [],
			datasets: [
				{
					label: 'Max',
					data: [],
					pointColor: '#bb2222',
					strokeColor: '#552222'
				},
				{
					label: 'Avg',
					data: [],
					pointColor: '#4444cc',
					strokeColor: '#444466'
				},
				{
					label: 'Min',
					data: [],
					pointColor: '#33aa44',
					strokeColor: '#334444'
				}
			]
		};

		var today = moment();
		$.each(allStats.slice(-10), function (index, stats) {
			var date = moment(stats.timestamp).utc();
			var format = 'HH:mm:ss';
			if (date.isBefore(today, 'day')) {
				format = 'YYYY-MM-DD HH:mm:ss';
			}

			data.labels.push(date.format(format));
			data.datasets[0].data.push(stats.maxPrice);
			data.datasets[1].data.push(stats.avgPrice);
			data.datasets[2].data.push(stats.minPrice);
		});

		var $canvas = $('<canvas width="500" height="320"></canvas>');
		$table.css({ 'margin-bottom': '2em' });
		$canvas.insertAfter($table).wrap('<div class="banner"></div>');

		var chart = new Chart($canvas[0].getContext('2d'));
		chart.Line(data, {
			datasetFill: false,
			scaleLabel: '<%=numeral(value).format(\'0[.]0a\')%>',
			multiTooltipTemplate: '<%=numeral(value).format(\'0,0\')%>'
		});
	});
});

