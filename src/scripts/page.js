require.config({
	baseUrl: '/',
	paths: {
		'moment': 'extlibs/momentjs/moment'
	},
	map: {
		'*': {
			'extlibs/jquery/jquery': 'scripts/jquery-private',
			'extlibs/momentjs/moment': 'moment'
		},
		'scripts/jquery-private': {
			'extlibs/jquery/jquery': 'extlibs/jquery/jquery'
		}
	}
});

require(['extlibs/less/less', 'scripts' + location.pathname.replace(/\.[^.]+$/, '')]);

