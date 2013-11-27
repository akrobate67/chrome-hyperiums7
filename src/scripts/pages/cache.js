chrome.storage.local.get(function (storage) {
	var reUrl = /^http:\/\/hyp2.hyperiums.com\//,
		tbody = $('#cache');
	$.each(storage, function (url, cache) {
		if (reUrl.test(url)) {
			tbody.append($('<tr>').append([
				$('<td>').append(
					$('<a target="_blank">').attr('href', url).text(url)
				),
				$('<td class="fixed-width">').text(
					moment(cache.time).format('YYYY-MM-DD HH:mm:ss')
				),
			]));
		}
	});
});

