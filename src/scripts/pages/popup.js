define(function (require) {
	var Hyperiums7 = require('classes/Hyperiums7');
	Hyperiums7.getSession().
		done(function (session) {
			location.href = '/pages/popup/menu.html';
		}).
		fail(function (error) {
			location.href = '/pages/login.html';
		});
});

