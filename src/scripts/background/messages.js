chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	switch (message.request) {
	case 'getCookie':
		chrome.cookies.get({
			url: 'http://hyp2.hyperiums.com/',
			name: 'HypII2'
		}, function (cookie) {
			sendResponse(cookie);
		});
		return true;
	case 'getAjaxCache':
		chrome.storage.local.get(message.url, function (storage) {
			storage[message.url] = storage[message.url] || { time: 0 };
			var now = new Date().getTime();
			if (storage[message.url].time + 600000 < now) {
				$.ajax(message.url, message.settings).done(function (data) {
					storage[message.url].time = now;
					storage[message.url].data = data;
					chrome.storage.local.set(storage);
					sendResponse(data);
				});
			} else {
				sendResponse(storage[message.url].data);
			}
		});
		return true;
	}
});

