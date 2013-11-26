var params = {};
$.each(location.search.substr(1).split('&'), function (_, pair) {
	var split = pair.split('=');
	params[split[0]] = split[1];
});

var url;
if (params.action == 'fdispmsg' && params.limit === undefined) {
	url = $('.hc.info:not(.avgtext) a').eq(-2).attr('href');
	if (url) {
		location.href = url;
	}
}

