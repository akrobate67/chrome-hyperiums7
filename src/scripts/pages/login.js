define(function (require) {
	var $ = require('extlibs/jquery/jquery');
	$(document).ready(function () {
		var Hyperiums7 = require('classes/Hyperiums7');

		$('#new-account').attr('href', Hyperiums7.getRegisterUrl());
		$('#lost-password').attr('href', Hyperiums7.getLostPasswordUrl());

		var nicknameInput = $('[name=nickname]'),
			passwordInput = $('[name=password]'),
			rememberInput = $('[name=remember]');

		var cfg;
		chrome.storage.sync.get('cfg', function (storage) {
			cfg = storage.cfg;
			if (cfg.auth.remember) {
				rememberInput.prop('checked', true);
				nicknameInput.val(cfg.auth.nickname);
			}
		});

		$('form').submit(function (event) {
			function showStatusMessage(msg) {
				$('#status').remove();
				$('button').after($('<p id="status">').text(msg));
			}

			function showErrorMessage(msg) {
				showStatusMessage(msg);
				$('#status').addClass('error');
			}

			event.preventDefault();
			var nickname = nicknameInput.val();
			$('input, button').prop('disabled', true);
			showStatusMessage('Checking...');
			Hyperiums7.login(nickname, passwordInput.val()).
				done(function (session) {
					showStatusMessage('Ok');
					if (rememberInput.is(':checked')) {
						cfg.auth.remember = true;
						cfg.auth.nickname = nickname;
						chrome.storage.sync.set({cfg: cfg});
					} else {
						cfg.auth.remember = false;
						cfg.auth.nickname = '';
						chrome.storage.sync.set({cfg: cfg});
					}
					location.href = '/pages/popup/menu.html';
				}).
				fail(function (errorMessage) {
					$('input, button').prop('disabled', false);
					switch(errorMessage) {
					case 'Unknown login name':
						errorMessage += ' ' + nickname;
						nicknameInput.val('').focus();
						passwordInput.val('');
						break;
					case 'Wrong password for ' + nickname:
						passwordInput.val('').focus();
						break;
					}
					showErrorMessage(errorMessage);
				})
		});
	});
});

