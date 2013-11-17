define(function (require) {
	var $ = require('extlibs/jquery/jquery');
	return {
		NAME: 'Hyperiums7',
		getSession: function () {
			var hyperiums = this,
				promise = $.Deferred();
			chrome.cookies.get({
				url: 'http://hyp2.hyperiums.com/',
				name: 'HypII2'
			}, function (cookie) {
				if (cookie) {
					var chunks = cookie.value.split('Z');
					promise.resolveWith(hyperiums, [{
						playerId: parseInt(chunks[0]),
						authKey: parseInt(chunks[1]),
						gameId: parseInt(chunks[2])
					}]);
				} else {
					promise.rejectWith(hyperiums, ['cookie is not set']);
				}
			});
			return promise;
		},
		getServletUrl: function (servlet) {
			return 'http://hyp2.hyperiums.com/servlet/' + servlet;
		},
		getLogoutUrl: function () {
			return this.getServletUrl('Logout') + '?logout_mode=&logout=Logout';
		},
		getRegisterUrl: function () {
			return this.getServletUrl('Login') + '?creationform&defaultgame=3';
		},
		getLostPasswordUrl: function () {
			return this.getServletUrl('Login') + '?lostpassword';
		},
		login: function (login, password) {
			var hyperiums = this,
				promise = $.Deferred();
			$.ajax({
				url: this.getServletUrl('Login'),
				data: {
					login: login,
					pwd: password,
					weblogin: 'Login',
					lang: 0
				},
				type: 'post'
			}).
				done(function (data, textStatus, jqXHR) {
					var errorMessage = $(data).find('.alert').text();
					if (errorMessage == '') {
						hyperiums.getSession().done(function (session) {
							promise.resolveWith(this, [session]);
						});
					} else {
						promise.rejectWith(this, [errorMessage]);
					}
				});
			return promise;
		},
		getNewEvents: function () {
			var promise = $.Deferred();
			$.ajax({
				url: this.getServletUrl('Planet'),
				data: {
					newplanetevents: ''
				}
			}).
				done(function (data, textStatus, jqXHR) {
					var doc = $(data), events = [];
					$('.tinytext', doc).each(function () {
						events.push({
							date: new Date($(this).text() + ' +00:00'),
							message: $(this).next().text().replace(/^System message: /, '')
						});
					});
					promise.resolveWith(this, [{
						events: events,
						hasBattleReport: $('[href="/servlet/Player?page=Reports"].warn', doc).length == 1,
						hasPersonalMessage: $('[rel="playerSubmenu"].warn', doc).length == 1,
						hasForumMessage: $('[rel="forumSubmenu"].warn', doc).length == 1,
					}]);
				});
			return promise;
		}
	};
});

