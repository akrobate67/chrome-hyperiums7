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
	
	div.text('Server Time: ' + moment(serverDate).utc().format('YYYY-MM-DD HH:mm:ss'));

	var ul = $('<ul>');
	$.each(ticks, function (_, tick) {
		ul.append($('<li>').text(tick.name + ': ' + moment(
			tick.getNextDate(serverDate).getTime() - serverDate.getTime()
		).utc().format('HH:mm:ss')));
	});
	div.append(ul);

	window.setTimeout(arguments.callee, 500);
})();

