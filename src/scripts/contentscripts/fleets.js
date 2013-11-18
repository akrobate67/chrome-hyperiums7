$('td > input[name="merge"]:not(:disabled)').after([
	' ',
	$('<input type="submit" class="button" name="merge" value="Merge All">').
		click(function (event) {
			$(this).closest('form').append([
				$('<input type="hidden" name="confirm">'),
				$('<input type="hidden" name="mgt_order_done">')
			]);
		})
]);
