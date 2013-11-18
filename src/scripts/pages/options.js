chrome.storage.sync.get('cfg', function(storage) {
	var cfg = storage.cfg;

	var nicknameInput = $('[name="auth.nickname"]');
	$('[name="auth.remember"]').
		prop('checked', cfg.auth.remember).
		change(function () {
			var isChecked = $(this).is(':checked');
			nicknameInput.prop({
				disabled: !isChecked,
				required: isChecked
			});
			if (!isChecked) {
				nicknameInput.val('');
			}
		}).change();
	nicknameInput.val(cfg.auth.nickname);

	var urlPatternInput = $('[name="external.urlPattern"]');
	$('[name="external.isEnabled"]').
		prop('checked', cfg.external.isEnabled).
		change(function () {
			var isChecked = $(this).is(':checked');
			urlPatternInput.prop({
				disabled: !isChecked,
				required: isChecked
			});
		}).change();
	urlPatternInput.val(cfg.external.urlPattern);

	$('#save-and-close').click(function () {
		$('form').data('close', true);
	});

	$('form').submit(function (event) {
		event.preventDefault();
		var form = $(this);
		cfg.auth.remember = $('[name="auth.remember"]').is(':checked');
		cfg.auth.nickname = $('[name="auth.nickname"]').val();
		cfg.external.isEnabled = $('[name="external.isEnabled"]').is(':checked');
		cfg.external.urlPattern = $('[name="external.urlPattern"]').val();
		chrome.storage.sync.set({cfg: cfg}, function () {
			alert('Options have been saved.');
			if (form.data('close')) {
				window.close();
			}
		});
	});
});

