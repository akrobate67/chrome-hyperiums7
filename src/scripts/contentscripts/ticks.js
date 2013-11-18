var offsetInMS = new Date().getTime() -
	new Date($('.servertime').eq(0).text().replace('Server Time: ', '') + ' +00:00');

$('.servertime').remove();
var div = $('<div id="hyperiums7-ticks" class="servertime">');
$('body').append(div);

var ticks = Hyperiums7.ticks;
ticks.sort(function (a, b) {
	a.name.localeCompare(b.name);
});

(function () {
	var serverDate = new Date(new Date().getTime() - offsetInMS);
	div.empty();
	var ul = $('<ul>');
	ul.append($('<li>').text(
		'Server Time: ' + moment(serverDate).utc().format('YYYY-MM-DD HH:mm:ss')
	));
	$.each(ticks, function (_, tick) {
		var nextDate = tick.getNextDate(serverDate);
		var msUntilNextDate = nextDate.getTime() - serverDate.getTime();
		var li = $('<li>').
			text(tick.name + ': ' + moment(msUntilNextDate).utc().format('HH:mm:ss')).
			attr('title', moment(nextDate).utc().format('YYYY-MM-DD HH:mm:ss'));
		if (msUntilNextDate < 10000) { // 10 seconds
			li.addClass('hyperiums7-blink');
		}
		if (msUntilNextDate < 60000) { // 1 minute
			li.addClass('alert');
		} else if (msUntilNextDate < 300000) { // 5 minutes
			li.addClass('alertLight');
		} else if (msUntilNextDate < 600000) { // 10 minutes
			li.addClass('hlight');
		}
		ul.append([' ', li]);
	});
	div.append(ul);

	window.setTimeout(arguments.callee, 500);
})();

