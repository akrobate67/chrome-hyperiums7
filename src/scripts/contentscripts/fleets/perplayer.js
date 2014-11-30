$(function () {
	if(location.href.indexOf('&perplayer=') != -1) {
		var $table = $('form').eq(0).children('table');
		var $button = $table.find('.button');
		var $buttonRow;
		if ($button.length) {
			$buttonRow = $button.closest('tr');
			$button.remove();
			$table.after(
				$('<div class="hr"></div>').text($buttonRow.text()).append($button)
			);
			$buttonRow.remove();
		}

		var $headers = $table.find('tr:not([class])');
		$table.find('tr').removeClass('line0 line1');
		$table.prepend($('<thead></thead>').append($headers.eq(0)));

		var $table2, $header2;
		if ($headers.length > 1) {
			$header2 = $headers.eq(0).clone();
			$header2.find('b').text($headers.eq(1).text());
			$table2 = $table
				.clone()
				.empty()
				.append([
					$('<thead>').append($header2),
					$('<tbody>').append($headers.eq(1).nextAll())
				])
				.insertAfter($table);
			$headers.eq(1).remove();
		}

		var options = { bPaginate: false, bAutoWidth: false };
		$.fn.dataTableExt.oStdClasses.sStripeOdd = 'line1';
		$.fn.dataTableExt.oStdClasses.sStripeEven = 'line0';
		$table.dataTable(options);
		if ($table2) {
			$table2.dataTable(options);
		}
	}
});

