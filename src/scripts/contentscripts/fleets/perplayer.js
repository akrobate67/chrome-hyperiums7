$(function () {
	if(location.href.indexOf('&perplayer=') != -1) {
		var $table = $('form').eq(0).children('table');
		$table.find('tr').removeClass('line0 line1');
		$.fn.dataTableExt.oStdClasses.sStripeOdd = 'line1';
		$.fn.dataTableExt.oStdClasses.sStripeEven = 'line0';
		$table
			.prepend(
				$('<thead></thead>')
					.append($table.find('tr:first-child'))
			)
			.dataTable({
				bPaginate: false
			});
	}
});

