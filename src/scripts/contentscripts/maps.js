$('[name="searchplanets"]').keydown(function (event) {
	if (event.which == 13) {
		event.preventDefault();
		$('#searchButton').click();
	}
});

