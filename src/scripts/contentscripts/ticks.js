var now = new Date();
var serverDate = new Date($('.servertime').eq(0).text().replace('Server Time: ', '') + ' +00:00');
var offsetInMS = now.getTime() - serverDate.getTime();
$('.servertime').empty();

var div = $('<div id="hyperiums7-ticks" class="servertime">');
$('body').append(div);

(function () {
	serverDate = new Date(new Date().getTime() - offsetInMS);
	
	div.text('Server Time: ' + moment(serverDate).utc().format('YYYY-MM-DD HH:mm:ss'));

	window.setTimeout(arguments.callee, 500);
})();

