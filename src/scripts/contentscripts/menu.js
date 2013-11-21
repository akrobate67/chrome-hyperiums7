$('#militarySubmenu ul').append([
	$('<li>').append($('<a target="_blank">Fleet calculator</a>').attr({
		href: chrome.runtime.getURL('pages/fleetcalc.html')
	}))
]);

