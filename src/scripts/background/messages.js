chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	if (message.request == 'getCookie') {
		chrome.cookies.get({
			url: 'http://hyp2.hyperiums.com/',
			name: 'HypII2'
		}, function (cookie) {
			sendResponse(cookie);
		});
		return true;
	}
});

