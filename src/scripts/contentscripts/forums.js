var params = {};
$.each(location.search.substr(1).split('&'), function (_, pair) {
	var split = pair.split('=');
	params[split[0]] = split[1];
});

var url;
if (params.action == 'fdispmsg' && params.limit === undefined && params.gotolast) {
	url = $('.hc.info:not(.avgtext) a').eq(-2).attr('href');
	if (url) {
		location.href = url;
	}
}

$('a').each(function (_, element) {
	element = $(element);
	var url = element.attr('href');
	if (/Forums\?action=fdispmsg&forumid=\d+&threadid=\d+&fatherthreadid=0$/.test(url)) {
		url += '&gotolast=1';
		element.after([
			' ',
			$('<a>').attr('href', url).text('⇒').attr('title', 'Last page')
		]);
	}
});

