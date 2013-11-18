chrome.runtime.onInstalled.addListener(function (details) {
	chrome.alarms.clearAll();

	chrome.storage.sync.get('cfg', function (storage) {
		function mergeObjects(a, b) {
			var k;
			for (k in b) {
				if (typeof a[k] == 'undefined') {
					a[k] = b[k];
				} else {
					mergeObjects(a[k], b[k]);
				}
			}
			return a;
		}

		chrome.storage.sync.set({cfg: mergeObjects(storage.cfg || {}, {
			auth: {
				remember: false,
				nickname: ''
			},
			external: {
				isEnabled: false,
				urlPattern: ''
			},
			notifications: {
				periodInMinutes: 1
			}
		})});
	});
});

