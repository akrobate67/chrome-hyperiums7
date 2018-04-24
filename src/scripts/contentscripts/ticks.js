$(function () {
var offsetInMS = new Date().getTime() -
	new Date($('.servertime').eq(0).text().replace('Server Time: ', '') + ' +00:00');

$('.servertime').remove();
	
var bkg = $('body').css('background-color');
var color = $('body').css('color');

var $div = $('<div id="hyperiums7-ticks" class="servertime" style="z-index:99;background-color:'+bkg+';color:'+color+';"></div>');
$('body').append($div);

var msPerPx = 10000;
var $timeline = $('<div class="timeline"></div>')
	.click(function (event) {
		if (event.altKey) {
			msPerPx *= 1.5;
		} else {
			msPerPx /= 1.5;
		}
	});

$(document)
	.keydown(function (event) {
		if (event.altKey) {
			$timeline.css({ cursor: 'zoom-out' });
		}
	})
	.keyup(function (event) {
		$timeline.css({ cursor: 'zoom-in' });
	});


$div.append($timeline);

var ticks = Hyperiums7.ticks;
var $ul;

var msPerH = 3600000;

(function () {
	var serverDate = new Date(new Date().getTime() - offsetInMS);
	$timeline.empty();
	if ($ul) {
		$ul.remove();
	}

	$ul = $('<ul>');
	$ul.append($('<li>').text(
		'Server Time: ' + moment(serverDate).utc().format('YYYY-MM-DD HH:mm:ss')
	));

	var timelineWidth = $timeline.width();
	$.each(ticks, function (tickIndex, tick) {
		var nextDate = tick.getNextDate(serverDate);
		var msUntilNextDate = nextDate.getTime() - serverDate.getTime();
		nextDate = moment(nextDate).utc();
		var $li = $('<li>').
			text(tick.name + ': ' + moment(msUntilNextDate).utc().format('HH:mm:ss')).
			attr('title', nextDate.format('YYYY-MM-DD HH:mm:ss'));

		if (msUntilNextDate < 10000) { // 10 seconds
			$li.addClass('hyperiums7-blink');
		}

		if (msUntilNextDate < 60000) { // 1 minute
			$li.addClass('alert');
		} else if (msUntilNextDate < 300000) { // 5 minutes
			$li.addClass('alertLight');
		} else if (msUntilNextDate < 600000) { // 10 minutes
			$li.addClass('hlight');
		}

		$ul.append([' ', $li]);

		var left = msUntilNextDate / msPerPx;
		while (left < timelineWidth) {
			$timeline.append(
				$('<div class="tick hlight"></div>')
					.css({ left: left, 'padding-top': (tickIndex / 2) + 'em' })
					.attr({ title: tick.name + '\n' + nextDate.format('HH:mm:ss') })
					.text(tick.name)
			);
			nextDate.add(tick.everyNthHour, 'hour');
			left += tick.everyNthHour * msPerH / msPerPx;
		}
	});

	$div.prepend($ul);
	window.setTimeout(arguments.callee, 500);
})();

});

