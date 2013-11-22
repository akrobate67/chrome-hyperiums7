function Tick(name, atMinute, everyNthHour, startHour) {
	this.name = name;
	this.atMinute = atMinute;
	this.everyNthHour = everyNthHour || 1;
	this.startHour = startHour || 0;
}

Tick.prototype.getNextDate = function (serverDate) {
	var nextDate = new Date(serverDate);
	nextDate.setUTCMilliseconds(0);
	nextDate.setUTCSeconds(0);
	nextDate.setUTCMinutes(this.atMinute);

	if (serverDate.getUTCMinutes() >= this.atMinute) {
		nextDate.setUTCHours(nextDate.getUTCHours() + 1);
	}

	var h = (nextDate.getUTCHours() + 24 - this.startHour) % this.everyNthHour;
	if (this.everyNthHour > 1 && h) {
		nextDate.setUTCHours(nextDate.getUTCHours() + this.everyNthHour - h);
	}
	return nextDate;
};

var Hyperiums7 = {
	NAME: 'Hyperiums7',
	getSession: function () {
		var hyperiums = this,
			promise = $.Deferred();
		chrome.runtime.sendMessage({request: 'getCookie'}, function (cookie) {
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
		return this.getServletUrl('Logout?logout_mode=&logout=Logout');
	},
	getRegisterUrl: function () {
		return this.getServletUrl('Login?creationform&defaultgame=3');
	},
	getLostPasswordUrl: function () {
		return this.getServletUrl('Login?lostpassword');
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
		}).done(function (data, textStatus, jqXHR) {
			var errorMessage = $(data).find('.alert').text();
			if (errorMessage == '') {
				hyperiums.getSession().done(function (session) {
					promise.resolveWith(hyperiums, [session]);
				});
			} else {
				promise.rejectWith(hyperiums, [errorMessage]);
			}
		});
		return promise;
	},
	checkHtmlForEvents: function (html) {
		var doc = $(html), message = {
			request: 'updateNotifications',
			hasEvents: $('[href="/servlet/Planet?newplanetevents="].warn', doc).length == 1,
			events: [],
			hasBattleReport: $('[href="/servlet/Player?page=Reports"].warn', doc).length == 1,
			hasPersonalMessage: $('[rel="playerSubmenu"].warn', doc).length == 1,
			hasForumMessage: $('[rel="forumSubmenu"].warn', doc).length == 1,
		};

		$.each({
			hasEvents: this.getServletUrl('Planet?newplanetevents='),
			hasBattleReport: this.getServletUrl('Player?page=Reports'),
			hasPersonalMessage: this.getServletUrl('Player?page=Inbox'),
			hasForumMessage: this.getServletUrl('Forums?action=lastmsg&allforums=no')
		}, function (propName, url) {
			if (location.href == url) {
				message[propName] = false;
			}
		});

		if (message.hasEvents) {
			if ($('[name="ackallpendingevents"]', doc).length == 0) {
				this.getNewEvents().done(function (events) {
					message.events = events;
					chrome.runtime.sendMessage(message);
				});
				return;
			}
			message.events = this.getEventsFromHtml(html);
		}
		chrome.runtime.sendMessage(message);
	},
	getNewEvents: function () {
		var hyperiums = this,
			promise = $.Deferred();
		$.ajax(this.getServletUrl('Planet?newplanetevents=')).
			done(function (data, textStatus, jqXHR) {
				promise.resolveWith(hyperiums, [hyperiums.getEventsFromHtml(data)]);
			});
		return promise;
	},
	getEventsFromHtml: function (html) {
		var doc = $(html), events = [];
		$('.tinytext', doc).each(function () {
			events.push({
			date: new Date($(this).text() + ' +00:00'),
			message: $(this).next().text().replace(/^System message: /, '')
			});
		});
		return events;
	},
	getFleetsInfo: function (args) {
		var promise = $.Deferred();
		args = args || {};
		args.planet = args.planet || '*';
		args.data = args.data || 'own_planets';
		args.request = 'getfleetsinfo';
		this.hapi(args).done(function (pairs) {
			var planets = [];
			$.each(pairs, function (key, value) {
				var i, j, keys = /^([^\.]+?)(\d+)(\.(\d+))?$/.exec(key)
				if (keys && keys.length) {
					key = keys[1];
					i = parseInt(keys[2]); // planet index
					j = parseInt(keys[4]); // fleet index

					if (!planets[i]) {
						planets[i] = {fleets: []};
					}

					switch (key) {
					case 'nrj':
					case 'nrjmax':
					case 'bomb':
					case 'carmies':
					case 'crui':
					case 'delay':
					case 'dest':
					case 'fleetid':
					case 'frace':
					case 'garmies':
					case 'scou':
					case 'sellprice':
					case 'starb':
						value = parseFloat(value);
						break;
					case 'isneutral':
					case 'stasis':
					case 'vacation':
					case 'autodrop':
					case 'bombing':
					case 'camouf':
					case 'defend':
						value = value == '1';
						break;
					case 'planet':
					case 'fname':
					case 'owner':
						break;
					default:
						throw 'unkown key ' + key + ' (' + value + ')';
					}

					switch (key) {
					case 'planet': key = 'name'; break;
					case 'isneutral': key = 'neutral'; break;
					case 'bomb': key = 'numBombers'; break;
					case 'crui': key = 'numCruisers'; break;
					case 'dest': key = 'numDestroyers'; break;
					case 'scou': key = 'numScouts'; break;
					case 'starb': key = 'numStarbases'; break;
					case 'camouf': key = 'camouflage'; break;
					case 'carmies': key = 'numCarriedArmies'; break;
					case 'fleetid': key = 'id'; break;
					case 'fname': key = 'name'; break;
					case 'frace': key = 'raceId'; break;
					case 'garmies': key = 'numGroundArmies'; break;
					}

					if (isNaN(j)) {
						planets[i][key] = value;
					} else {
						if (!planets[i].fleets[j]) {
							planets[i].fleets[j] = {};
						}
						planets[i].fleets[j][key] = value;
					}
				} else {
					planets[key] = value;
				}
			});
			promise.resolveWith(this, [planets]);
		});
		return promise;
	},
	hapi: function (args) {
		var promise = $.Deferred();
		this.getSession().done(function (session) {
			args.gameid = args.gameid || session.gameId;
			args.playerid = args.playerid || session.playerId;
			args.authkey = args.authkey || session.authKey;
			$.ajax({
				url: this.getServletUrl('HAPI'),
				data: args
			}).done(function (data, textStatus, jqXHR) {
				var pairs = {};
				$.each(data.split('&'), function (_, pair) {
					var split = pair.split('=');
					pairs[split[0]] = split[1];
				});
				promise.resolveWith(this, [pairs]);
			});
		});
		return promise;
	},
	getBattleReports: function () {
		var promise = $.Deferred(),
			hyperiums = this;
		$.ajax(this.getServletUrl('Player?page=Reports')).
			done(function (data, textStatus, jqXHR) {
				var reports = [];
				$('input[type=checkbox]', data).each(function (i, element) {
					var matches;
					element = $(element);
					if (/^r\d+$/.test(element.attr('name'))) {
						matches = /^(\d\d\d\d\-\d\d-\d\d \d\d:\d\d:\d\d)Planet (.+)$/.exec(element.closest('td').next().text());
						reports.push({
							id: parseInt(element.val()),
							date: new Date(matches[1] + ' +00:00'),
							planetName: matches[2]
						});
					}
				});
				promise.resolveWith(hyperiums, [reports]);
			});
		return promise;
	},
	ticks: [
		new Tick('Build', 23),
		new Tick('Cash', 31, 8, 6),
		new Tick('Move/Control', 26),
		new Tick('Tech', 18),
		new Tick('N/A', 6),
		new Tick('Battle', 6, 2),
		new Tick('Energy', 18)
	].sort(function (a, b) {
		return a.name.localeCompare(b.name);
	}),
	races: ['Human', 'Azterk', 'Xillor'],
	products: ['Agro', 'Minero', 'Techno'],
	governments: ['Dictatorial', 'Authoritarian', 'Democratic', 'Hyp.protect.'],
	govs: ['Dict.', 'Auth.', 'Demo.', 'Hyp.'],
	units: ['Factories', 'Destroyers', 'Cruisers', 'Scouts', 'Bombers', 'Starbases'],
	spaceAveragePower: [
		// [Human, Azterk, Xillor]
		[0, 0, 0], // Factories
		[56, 73, 67], // Destroyers
		[319, 393, 475], // Cruisers
		[8, 6, 7], // Scouts
		[66, 85, 105], // Bombers
		[2583, 2583, 2583] // Starbases
	],
	// [Human, Azterk, Xillor]
	groundAveragePower: [300, 360, 240],
	upkeepCosts: [
		// [Human, Azterk, Xillor]
		[1800, 1900, 2100], // Factories
		[1000, 1000, 1000], // Destroyers
		[7200, 7200, 7200], // Cruisers
		[150, 150, 150], // Scouts
		[1000, 1000, 1000], // Bombers
		[100000, 100000, 100000], // Starbases
		[2000, 2000, 2000], // Ground Armies
		[3000, 3000, 3000] // Carries Armies
	],
	buildCosts: [
		// [Agro, Minero, Techno]
		[40000, 40000, 40000], // Factories
		[10000, 8500, 7500], // Destroyers
		[60000, 51000, 45000], // Cruisers
		[1500, 1275, 1125], // Scouts
		[25000, 21250, 18750], // Bombers
		[2000000, 1700000, 1500000] // Starbases
	],
	timeToBuild: [ // ticks with 1 factorie, no stasis
		// [Human, Azterk, Xillor]
		[11, 12, 13], // Factories
		[4, 8.08, 13], // Destroyers
		[25, 50, 85], // Cruiseres
		[1, 1, 2], // Scouts
		[5, 7, 10], // Bombers
		[0, 0, 0] // Starbases
	],
	timeToBuildMultiplier: {
		// [Dict., Auth., Demo.]
		governments: [0.8, 1, 1],
		// [Agro, Minero, Techno
		products: [1, 1, 0.85],
		// [off, on]
		stasis: [1, 3]
	},
	getPlanetInfo: function (args) {
		var promise = $.Deferred();
		args = args || {};
		args.planet = args.planet || '*';
		args.data = args.data || 'general';
		args.request = 'getplanetinfo';
		this.hapi(args).done(function (pairs) {
			var planets = []
			planets.ids = [];
			$.each(pairs, function (key, value) {
				var i, keys = /^(.+?)_?(\d+)$/.exec(key);
				if (keys && keys.length) {
					key = keys[1];
					i = parseInt(keys[2]);

					if (!planets[i]) {
						planets[i] = {};
					}

					switch (key) {
					case 'activity':
					case 'block':
					case 'civlevel':
					case 'defbonus':
					case 'ecomark':
					case 'expinpipe':
					case 'exploits':
					case 'factories':
					case 'gov':
					case 'govd':
					case 'nexus':
					case 'nrj':
					case 'nrjmax':
					case 'nxbuild':
					case 'nxbtot':
					case 'orbit':
					case 'planetid':
					case 'pop':
					case 'ptype':
					case 'purif':
					case 'race':
					case 'sc':
					case 'size':
					case 'tax':
					case 'x':
					case 'y':
						value = parseFloat(value);
						break;
					case 'bhole':
					case 'stasis':
					case 'parano':
						value = value == '1';
						break;
					case 'planet':
					case 'publictag':
					case 'tag1':
					case 'tag2':
						break;
					default:
						throw 'unkown key ' + key + ' (' + value + ')';
					}

					switch (key) {
					case 'bhole': key = 'blackholed'; break;
					case 'civlevel': key = 'civ'; break;
					case 'ecomark': key = 'eco'; break;
					case 'expinpipe': key = 'numExploitsInPipe'; break;
					case 'exploits': key = 'numExploits'; break;
					case 'factories': key = 'numFactories'; break;
					case 'gov': key = 'governmentId'; break;
					case 'govd': key = 'governmentDaysLeft'; break;
					case 'planet': key = 'name'; break;
					case 'planetid': key = 'id'; break;
					case 'ptype': key = 'productId'; break;
					case 'publictag': key = 'tag'; break;
					case 'purif': key = 'purificationHoursLeft'; break;
					case 'race': key = 'raceId'; break;
					}

					planets[i][key] = value;
					if (key == 'id') {
						planets.ids[value] = planets[i];
					}
				} else {
					planets[key] = value;
				}
			});
			promise.resolveWith(this, [planets]);
		});
		return promise;
	},
	getBuildPipeTotals: function (pipe, planet) {
		var totals = {
			timeToBuild: 0,
			upkeepCosts: 0,
			buildCosts: 0,
			spaceAveragePower: 0
		},
			multiplier =
				this.timeToBuildMultiplier.governments[planet.governmentId] *
				this.timeToBuildMultiplier.products[planet.productId] *
				this.timeToBuildMultiplier.stasis[planet.stasis ? 1 : 0],
			numFactories = planet.numFactories,
			raceId = planet.raceId,
			productId = planet.productId,
			factoryUnitId = this.units.indexOf('Factories'),
			hyperiums = this;

		$.each(pipe, function (_, order) {
			if (order.unitId == factoryUnitId) {
				totals.timeToBuild += multiplier *
					Math.log((order.count + numFactories) / numFactories) /
					Math.log(1 + 1 / hyperiums.timeToBuild[order.unitId][raceId]);
				numFactories += order.count;
			} else {
				totals.timeToBuild += order.count * multiplier / numFactories *
					hyperiums.timeToBuild[order.unitId][raceId];
			}

			totals.upkeepCosts += order.count *
				hyperiums.upkeepCosts[order.unitId][raceId];
			totals.buildCosts += order.count *
				hyperiums.buildCosts[order.unitId][productId];
			totals.spaceAveragePower += order.count *
				hyperiums.spaceAveragePower[order.unitId][productId];
		});
		return totals;
	},
	getPlanetIdInfluence: function (planetId) {
		var promise = $.Deferred(), hyperiums = this;
		$.ajax({
			url: this.getServletUrl('Planet'),
			data: {
				cancelabandon: '',
				planetid: planetId
			}
		}).done(function (data, textStatus, jqXHR) {
			promise.resolveWith(hyperiums, [
				parseFloat($('.planetName', $(data)).siblings('b').text().replace(/,/g, ''))
			]);
		});
		return promise;
	}
};

