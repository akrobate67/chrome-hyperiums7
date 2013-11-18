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

function clearNotification(notificationId) {
	setBrowserAction();
	chrome.notifications.clear(notificationId, function (wasCleared) {
	});
}

function onButtonClicked(notificationId, buttonIndex) {
	var viewUrl, acknowledgeUrl;
	switch (notificationId) {
	case 'events':
		viewUrl = Hyperiums7.getServletUrl('Planet?newplanetevents=');
		acknowledgeUrl = Hyperiums7.getServletUrl('Home?ackallpendingevents');
		break;
	case 'forums':
		viewUrl = Hyperiums7.getServletUrl('Forums?action=lastmsg&allforums=no');
		break;
	case 'pm':
		viewUrl = Hyperiums7.getServletUrl('Player?page=Inbox');
		break;
	case 'battle':
		viewUrl = Hyperiums7.getServletUrl('Player?page=Reports');
		break;
	}
	if (viewUrl && buttonIndex == 0) {
		window.open(viewUrl);
		if (!acknowledgeUrl) { // no acknowledge url means events are acknowledged on view
			clearNotification(notificationId);
		}
	} else if (acknowledgeUrl && buttonIndex == 1) {
		window.open(acknowledgeUrl);
		clearNotification(notificationId);
	}
}

chrome.notifications.onClicked.addListener(function (notificationId) {
	onButtonClicked(notificationId, 0);
});

chrome.notifications.onButtonClicked.addListener(onButtonClicked);

var ALARM_NAME = 'Hyperiums7.events';
chrome.alarms.onAlarm.addListener(function (alarm) {
	if (alarm.name == ALARM_NAME) {
		$.ajax(Hyperiums7.getServletUrl('Planet?newplanetevents=')).
			done(function (data, textStatus, jqXHR) {
				Hyperiums7.checkHtmlForEvents(data);
			});
	}
});

chrome.alarms.create(ALARM_NAME, {periodInMinutes: 0.1});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	var action, notifications = [], notification;
	if (message.hasForumMessage) {
		action = {
			title: 'New post(s) in alliances forums',
			badge: {text: 'COM', color: '#3c59aa'}
		};
		notifications.push({
			id: 'forums',
			options: {
				title: action.title,
				buttons: [{title: 'Click to view last 20 messages from alliances forums'}]
			}
		});
	}
	if (message.hasPersonalMessage) {
		action = {
			title: 'New personal message(s)',
			badge: {text: 'PM', color: '#5fd077'}
		};
		notifications.push({
			id: 'pm',
			options: {
				title: action.title,
				buttons: [{title: 'Click to view message(s)'}]
			}
		});
	}
	if (message.hasEvents) {
		action = {
			title: message.events.length + ' new event(s)',
			badge: {
				text: message.events.length.toString(),
				color: '#ff4444'
			}
		};
		notification = {
			id: 'events',
			options: {
				title: action.title,
				type: 'list',
				items: [],
				buttons: [
					{title: 'Click to view events'},
					{title: 'Click to acknowledge events'}
				]
			}
		};
		$.each(message.events, function (_, event) {
			notification.options.items.push({
				title: moment(event.date).utc().format('D/MM HH:mm'),
				message: event.message
			});
		});
		notifications.push(notification);
	}
	if (message.hasBattleReport) {
		action = {
			title: 'New battle report(s)',
			badge: {text: 'BT', color: '#ff4444'}
		};
		notifications.push({
			id: 'battle',
			options: {
				title: action.title,
				buttons: [{title: 'Click to view battle report(s)'}]
			}
		});
	}

	setBrowserAction(action);
	$.each(notifications, function (_, notification) {
		notification.options.type = notification.options.type || 'basic';
		notification.options.iconUrl = '/assets/icon_48.png';
		notification.options.message = notification.options.message || notification.options.title;
		chrome.notifications.create(
			notification.id,
			notification.options,
			function (notificationId) {
			}
		);
	});
});

