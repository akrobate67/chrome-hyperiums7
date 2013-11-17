define(function (require) {
	function setBrowserAction(action) {
		action = action || {};
		chrome.browserAction.setTitle({title: action.title || ''});
		if (action.badge && action.badge.text) {
			chrome.browserAction.setBadgeText({text: action.badge.text});
			chrome.browserAction.setBadgeBackgroundColor({color: action.badge.color || 'white'});
		} else {
			chrome.browserAction.setBadgeText({text: ''});
		}
	}

	var NOTIFICATION_ID = 'Hyperiums7.events',
		viewUrl, acknowledgeUrl, lastEventType;

	chrome.notifications.onClicked.addListener(function (notificationId) {
		if (notificationId == NOTIFICATION_ID) {
			if (viewUrl) {
				window.open(viewUrl);
			}
		}
	});

	chrome.notifications.onButtonClicked.addListener(function (notificationId, buttonIndex) {
		if (notificationId == NOTIFICATION_ID) {
			if (buttonIndex == 0) {
				window.open(viewUrl);
			} else if (buttonIndex == 1) {
				window.open(acknowledgeUrl);
			}
		}
	});

	chrome.alarms.onAlarm.addListener(function (alarm) {
		if (alarm.name != 'checkForEvents') {
			return;
		}
		
		require([
			'classes/Hyperiums7',
			'extlibs/jquery/jquery',
			'extlibs/momentjs/moment'
		], function (Hyperiums7, $, moment) {
			Hyperiums7.getNewEvents().
				done(function(events) {
					var action, notification, eventType;
					if (events.hasBattleReport) {
						action = {
							title: 'New battle report(s)',
							badge: {text: 'BT', color: '#ff4444'}
						};
						notification = {
							buttons: [{title: 'Click to view battle report(s)'}]
						}
						viewUrl = Hyperiums7.getServletUrl('Player') + '?page=Reports';
						eventType = 'battle';
					} else if (events.events.length) {
						action = {
							title: events.events.length + ' new event(s)',
							badge: {
								text: events.events.length.toString(),
								color: '#ff4444'
							}
						};

						notification = {
							type: 'list',
							items: [],
							buttons: [
								{title: 'Click to view events'},
								{title: 'Click to acknowledge events'}
							]
						};
						$.each(events.events, function(_, event) {
							notification.items.push({
								title: moment(event.date).utc().format('D/MM HH:mm'),
								message: event.message
							});
						});
						viewUrl = Hyperiums7.getServletUrl('Planet') + '?newplanetevents=';
						acknowledgeUrl = Hyperiums7.getServletUrl('Home') + '?ackallpendingevents';
						eventType = 'event' + events.events.length;
					} else if (events.hasPersonalMessage) {
						action = {
							title: 'New personal message(s)',
							badge: {text: 'PM', color: '#5fd077'
							}
						};
						notification = {
							buttons: [{title: 'Click to view message(s)'}]
						}
						viewUrl = Hyperiums7.getServletUrl('Player') + '?page=Inbox';
						eventType = 'pm';
					} else if (events.hasForumMessage) {
						action = {
							title: 'New post(s) in alliances forums',
							badge: {text: 'COM', color: '#3c59aa'}
						};
						notification = {
							buttons: [{title: 'Click to view last 20 messages from alliances forums'}]
						};
						viewUrl = Hyperiums7.getServletUrl('Forums') + '?action=lastmsg&allforums=no';
						eventType = 'forum';
					} else {
						viewUrl = undefined;
						acknowledgeUrl = undefined;
						eventType = undefined;
					}

					setBrowserAction(action);
					if (notification && eventType != lastEventType) {
						lastEventType = eventType;
						notification.type = notification.type || 'basic';
						notification.iconUrl = '/assets/icon_48.png';
						notification.title = 'Hyperiums 7';
						notification.message = action.title;
						chrome.notifications.clear('Hyperiums7.events', function (wasCleared) {
							chrome.notifications.create('Hyperiums7.events', notification, function (notificationId) {
							});
						});
					}
				});
		});
	});

	chrome.alarms.create('checkForEvents', {periodInMinutes: 1});
});

