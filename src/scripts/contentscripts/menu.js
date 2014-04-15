$(document).ready(function () {
	$('#militarySubmenu ul').append([
		$('<li>').append($('<a target="_blank">Fleet calculator</a>').attr({
			href: chrome.runtime.getURL('pages/fleets/calc.html') })),
		$('<li>').append($('<a target="_blank">Fleet spread sheet</a>').attr({
				href: chrome.runtime.getURL('pages/fleets/spreadsheet.html') }))
	]).closest('.megawrapper').css('height', '+=30px');
});

