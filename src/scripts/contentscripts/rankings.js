$(document).ready(function () {
	if ($('button[name="individual"][value="1"]#checkButton').length) {
		$('.stdArray tr').each(function (_, element) {
			var tr = $(element), playerTd = tr.children('td:first');
			var playerName = playerTd.children('b').text();
			playerTd.prepend(
				$('<a target="_blank"><img src="/themes/theme1/misc/activity.png"></a>').
				attr('href', 'https://atlas.hyp-legacy.com/#tab=history&game=Hyperiums9&player='+	encodeURIComponent(playerName)), ' ');
		});
	}
});

//beka