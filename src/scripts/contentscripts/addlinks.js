var walker = document.createTreeWalker(
	document.body,
	NodeFilter.SHOW_TEXT,
	null,
	false
);

var MODE_TEXT = 0;
var MODE_TABLE = 1;

var node,
	replacements = [], removals = [],
	mode = MODE_TEXT,
	table, numRows, hasHeader, totals, maxNumColumns = 0;

function addReplacement(original, substitute) {
	replacements.push({
		substitute: substitute,
		original: original
	});
}

function addRemoval(node) {
	removals.push(node);
	if (node.nextSibling && node.nextSibling.nodeName == 'BR') {
		removals.push(node.nextSibling);
	}
}

var reAbsNumber = /^\d+([\.,]\d+)? *([tbmk])?$/i,
	reDate = /^\d\d\d\d\-\d\d\-\d\d \d\d:\d\d(:\d\d)?$/,
	reOtherNumber = /\d+.*$/,
	reUrl = /\b(https?:\/\/\S+[a-z0-9_\?\-#&=]|[a-z0-9\._%+\-]+@[a-z0-9\.\-]+\.[a-z]{2,6})/ig,
	reHttp = /^https?:\/\//i,
	reColumns = /^([^\|]+ ?\| ?)+([^\|]+)$/i,
	reHr = /^(\-\-+)|(==+)$/;

function textToValue(text) {
	text = $.trim(text);
	if (reAbsNumber.test(text)) {
		return numeral().unformat(text.replace(',', '.').toLocaleLowerCase());
	} else if (reDate.test(text)) {
		return new Date(text + ' +00:00');
	} else if (reOtherNumber.test(text)) {
		return 0;
	}
	return text;
}

while (node = walker.nextNode()) {
	if (node.parentNode.nodeName == 'TEXTAREA' ||
		node.parentNode.nodeName == 'SCRIPT' ||
		$(node).closest('table').parent().closest('table').prev('form').length
	) {
		continue;
	}
	var index = 0, match, span, a, url, tr,
		text = node.nodeValue,
		lineIsTable = reColumns.test(text);

	if (node.parentNode.nodeName != 'PRE' &&
		node.parentNode.nodeName != 'B' && (
		lineIsTable || mode == MODE_TABLE
	)) {
		if (lineIsTable) {
			if (mode == MODE_TABLE) {
				addRemoval(node);
			} else {
				mode = MODE_TABLE;
				table = $('<table class="stdArray" width="100%">');
				numRows = 0;
				hasHeader = false;
				totals = [];
				addReplacement(node, table[0]);
			}

			tr = $('<tr>').
				addClass('line' + (++numRows % 2)).
				mouseover(function () { $(this).addClass('lineCenteredOn'); }).
				mouseout(function () { $(this).removeClass('lineCenteredOn'); });

			$.each($.trim(text).split(/ ?\| ?/), function (i, text) {
				var value = textToValue(text), td;
				td = $('<td>')
				if (typeof value == 'number') {
					if (!totals[i]) {
						totals[i] = 0;
					}
					totals[i] += value;
					td.addClass('hr');
				} else if (value instanceof Date) {
					td.addClass('hc');
					text = moment(value).utc().format('YYYY-MM-DD HH:mm');
				}
				tr.append(td.text(text));
			});

			maxNumColumns = Math.max(maxNumColumns, tr.children().length);
			table.append(tr);
		} else if (reHr.test(text)) {
			addRemoval(node);
			if (!hasHeader) {
				hasHeader = true;
				table.find('tr').addClass('stdArray');
			}
		} else {
			if (totals.length) {
				tr = $('<tr class="stdArray">');
				$.each(totals, function (i, value) {
					var td = $('<td>');
					if (!value && !i) {
						td.text('Total');
					} if (value) {
						td.addClass('hr').text(numeral(value).format('0[.]0a'));
					}
					tr.append(td);
				});
				table.append(tr);
			}
			while (tr.children().length < maxNumColumns) {
				tr.append($('<td>'));
			}
			mode = MODE_TEXT;
		}
	}

	if (mode == MODE_TEXT) {
		while (match = reUrl.exec(text)) {
			if (!span) {
				span = document.createElement('span');
			}
			span.appendChild(document.createTextNode(
				text.substring(index, match.index)
			));

			url = match[0];
			if (url.indexOf('@') > -1 && !reHttp.test(url)) {
				url = 'mailto:' + url;
			}

			a = document.createElement('a');
			a.setAttribute('href', url);
			a.setAttribute('target', '_blank');
			a.appendChild(document.createTextNode(match[0]));
			span.appendChild(a);

			index = match.index + match[0].length;
		}

		if (index) {
			span.appendChild(document.createTextNode(
				text.substring(index)
			));
			addReplacement(node, span);
			span = undefined;
		}
	}
}

replacements.map(function (replacement) {
	replacement.original.parentNode.replaceChild(
		replacement.substitute,
		replacement.original
	);
});

removals.map(function (node) {
	node.parentNode.removeChild(node);
});

