var walker = document.createTreeWalker(
	document.body,
	NodeFilter.SHOW_TEXT,
	null,
	false
);

var node, replacements = [];
while (node = walker.nextNode()) {
	if (node.parentNode.nodeName == 'TEXTAREA') {
		continue;
	}
	var re = /\b(https?:\/\/\S+[a-z0-9_\?\-#&=]|[a-z0-9\._%+\-]+@[a-z0-9\.\-]+\.[a-z]{2,6})/ig,
		reHttp = /https?:\/\//i,
		index = 0, match, span, a, url,
		text = node.nodeValue;

	span = document.createElement('span');
	while (match = re.exec(text)) {
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
		replacements.push({
			substitute: span,
			original: node
		});
	}
}

replacements.map(function (replacement) {
	replacement.original.parentNode.replaceChild(
		replacement.substitute,
		replacement.original
	);
});

