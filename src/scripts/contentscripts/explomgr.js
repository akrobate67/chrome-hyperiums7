$('form #stdArray td:nth-child(4)').append(
	$('<input maxlength="4" size="4">').
		keydown(function (event) {
			if (event.which == 13) {
				event.preventDefault();
			}
		}).
		on('input', function () {
			$(this).closest('table').find(':not(#stdArray) input[type="text"]').val($(this).val());
		})
);

