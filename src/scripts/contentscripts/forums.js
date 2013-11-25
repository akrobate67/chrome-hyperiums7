var params = {};
$.each(location.search.substr(1).split('&'), function (_, pair) {
	var split = pair.split('=');
	params[split[0]] = split[1];
});

if (params.action == 'fdispmsg' && params.limit === undefined) {
	location.href = $('.hc.info:not(.avgtext) a').eq(-2).attr('href');
}

