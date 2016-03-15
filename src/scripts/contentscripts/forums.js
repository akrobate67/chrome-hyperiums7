var params = {};
$.each(location.search.substr(1).split('&'), function (_, pair) {
	var split = pair.split('=');
	params[split[0]] = split[1];
});

var url;
if (params.action == 'fdispmsg' && params.limit === undefined && params.gotolast) {
	url = $('.paging a').eq(-2).attr('href');
	if (url) {
		location.href = url;
	}
}

$('a').each(function (_, element) {
	element = $(element);
	var url = element.attr('href'),
		matches = /Forums\?action=fdispmsg&forumid=(\d+)&threadid=\d+&fatherthreadid=0$/.exec(url),
		forumId;

	if (matches && matches.length) {
		forumId = parseFloat(matches[1]);
		url += '&gotolast=1';
		element.after([
			' ',
			$('<a>').attr('href', url).text('⇒').attr('title', 'Last page')
		]);

		element.closest('.msgForum').find('a[href*="Alliance?tagid="]').each(function (_, element) {
			element = $(element);
			var matches = /(^\[[^\]]+\]) (.+)$/.exec(element.text());
			element.replaceWith([
				$('<a>').text(matches[1]).attr('href', element.attr('href')),
				' ',
				$('<a>').text(matches[2]).attr('href', 'Forums?action=fenter&forumid=' + forumId)
			]);
		});
	}
});

if ($('.megaCurrentItem').attr('href') === 'Forums') {
	$('.forumArray').before([
		$('<form class="hl" style="width:700px"></form>')
			.append([
				$('<input name="query"/>'),
				' ',
				$('<input type="submit" class="button" value="Search"/>')
			])
			.submit(function (event) {
				event.preventDefault();

				$('#hyperiums7-forum-search-results').remove();
				
				var $form = $(this);
				var $inputs = $form.find(':input').prop('disabled', true);
				$.get(
					'http://hyperiums.resident-uhlig.de/api.php/forum/search',
					{ query: $form.find('input[name="query"]').val() }
				)
					.done(function (result) {
						if (!result || !result.rows) {
							alert('Fail: no result rows');
							return;
						}
						
						if (result.rows.length === 0) {
							alert('No results.');
							return;
						}
						
						var $results = $('<div id="hyperiums7-forum-search-results" class="hc" style="margin:1em 0"></div>');
						$.each(result.rows, function (index, row) {
							$results.append(
								$('<table class="hc"></table>').append([
									$('<tr class="msgForum"></tr>').append($('<td colspan="2"></td>').append(
										$('<table width="100%"></table>').append($('<tr></tr>')).append([
											$('<td width="610"></td>').text(row.forum_title),
											$('<td class="hc">View thread</td>')
										])
									)),
									
									$('<tr></tr>').append([
										$('<td class="vt"></td>').append(
											$('<table class="sender" width="160"></table>').append($('<tr></tr>').append(
												$('<td width="100%" class="playerTitle"></td>').append([
													document.createTextNode(row.post_datetime),
													'<br/>',
													document.createTextNode(row.player_name)
												])
											))
										),
										$('<td class="vt"></td>').append([
											$('<table width="570"></table>').append($('<tr></tr>').append([
												$('<td width="420" class="postTitle playerTitle" style="height: 28px"></td>').text(row.post_subject),
												$('<td width="150" class="hc vc playerTitle">Reply</td>')
											])),
											
											$('<table width="570" class="hc body"></table>').append($('<tr></tr>').append(
												$('<td class="player"></td>').append(
													$('<div style="width:568px; overflow-x:auto;"></div>').html(row.post_message)
												)
											))
										])
									]),
									
									$('<tr><td colspan="2"><div class="spacer10"></div></td></tr>')
								])
							);
						});
						
						$form.after($results);
					})
					.fail(function (xhr, status, error) {
						status = status || '';
						error = error || '';
						alert('Fail: ' + status + ' ' + error);
					})
					.always(function () {
						$inputs.prop('disabled', false);
					});
			}),
		'<br/><br/>'
	]);
}

