define(function (require) {
	describe('Hyperiums7', function () {
		function randomInt() {
			return Math.round(Math.random() * 100000);
		}

		require('extlibs/jasmine/jasmine');
		var Hyperiums7 = require('classes/Hyperiums7');

		it('should be version 7', function () {
			expect(Hyperiums7.NAME).toEqual('Hyperiums7');
		});

		it('should return session if cookie is set', function () {
			var doneIsCalled = false,
				failIsCalled = false,
				alwaysIsCalled = false;

			runs(function () {
				var playerId = randomInt(),
					authKey = randomInt(),
					gameId = randomInt();
				chrome.cookies.set({
					url: 'http://hyp2.hyperiums.com',
					name: 'HypII2',
					value: [playerId, authKey, gameId].join('Z')
				}, function (cookie) {
					Hyperiums7.getSession().
						done(function (session) {
							doneIsCalled = true;
							expect(this).toEqual(Hyperiums7);
							expect(session).toEqual({
								playerId: playerId,
								authKey: authKey,
								gameId: gameId
							});
						}).
						fail(function () {
							failIsCalled = true;
						}).
						always(function () {
							alwaysIsCalled = true;
						});
				});
			});

			waitsFor(function () {
				return alwaysIsCalled;
			});

			runs(function () {
				expect(doneIsCalled).toBeTruthy();
				expect(failIsCalled).toBeFalsy();
			});
		});

		it('should return error if cookie is not set', function () {
			var doneIsCalled = false,
				failIsCalled = false,
				alwaysIsCalled = false;

			runs(function () {
				chrome.cookies.remove({
					url: 'http://hyp2.hyperiums.com',
					name: 'HypII2'
				}, function (cookie) {
					Hyperiums7.getSession().
						done(function (session) {
							doneIsCalled = true;
						}).
						fail(function (errorMessage) {
							failIsCalled = true;
							expect(this).toEqual(Hyperiums7);
							expect(errorMessage).toEqual('cookie is not set');
						}).
						always(function () {
							alwaysIsCalled = true;
						});
				});
			});

			waitsFor(function () {
				return alwaysIsCalled;
			});

			runs(function () {
				expect(doneIsCalled).toBeFalsy();
				expect(failIsCalled).toBeTruthy();
			});
		});

		it('should return servlet URLs', function () {
			expect(Hyperiums7.getServletUrl('Home')).toEqual('http://hyp2.hyperiums.com/servlet/Home');
		});

		it('should know some URLs', function () {
			var base = 'http://hyp2.hyperiums.com/servlet/';
			expect(Hyperiums7.getLogoutUrl()).toEqual(base + 'Logout?logout_mode=&logout=Logout');
			expect(Hyperiums7.getRegisterUrl()).toEqual(base + 'Login?creationform&defaultgame=3');
			expect(Hyperiums7.getLostPasswordUrl()).toEqual(base + 'Login?lostpassword');
		});

		it('should return session after successfull login', function () {
			var doneIsCalled = false,
				failIsCalled = false,
				alwaysIsCalled = false;

			runs(function () {
				Hyperiums7.login(
					'postmaster',
					'stoffel10'
				).
					done(function (session) {
						doneIsCalled = true;
						expect(this).toEqual(Hyperiums7);
						expect(session.authKey).toEqual(jasmine.any(Number));
						expect(session.gameId).toEqual(jasmine.any(Number));
						expect(session.playerId).toEqual(jasmine.any(Number));
					}).
					fail(function () {
						failIsCalled = true;
					}).
					always(function () {
						alwaysIsCalled = true;
					});
			});

			waitsFor(function () {
				return alwaysIsCalled;
			});

			runs(function () {
				expect(doneIsCalled).toBeTruthy();
				expect(failIsCalled).toBeFalsy();
			});
		});

		it('should return error mesasge after failed login', function () {
			var doneIsCalled = false,
				failIsCalled = false,
				alwaysIsCalled = false;

			runs(function () {
				Hyperiums7.login(
					'foo',
					'foo'
				).
					done(function (session) {
						doneIsCalled = true;
					}).
					fail(function (errorMessage) {
						failIsCalled = true;
						console.log(errorMessage);
					}).
					always(function () {
						alwaysIsCalled = true;
					});
			});

			waitsFor(function () {
				return alwaysIsCalled;
			});

			runs(function () {
				expect(doneIsCalled).toBeFalsy();
				expect(failIsCalled).toBeTruthy();
			});
		});
	});
});

