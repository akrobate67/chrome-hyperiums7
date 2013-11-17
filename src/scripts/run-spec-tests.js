require.config({
	baseUrl: '/',
	map: {
		'*': {
			'extlibs/jquery/jquery': 'scripts/jquery-private'
		},
		'scripts/jquery-private': {
			'extlibs/jquery/jquery': 'extlibs/jquery/jquery'
		}
	},
	shim: {
		'extlibs/jasmine/jasmine-html': {
			deps: ['extlibs/jasmine/jasmine']
		}
	}
});

require([
	'extlibs/jquery/jquery',
	'extlibs/jasmine/jasmine', 'extlibs/jasmine/jasmine-html',
	'specs/classes/Hyperiums7'
], function ($){
	var jasmineEnv = jasmine.getEnv();
	jasmineEnv.updateInterval = 250;

	var htmlReporter = new jasmine.HtmlReporter();
	jasmineEnv.addReporter(htmlReporter);

	jasmineEnv.specFilter = function (spec) {
		return htmlReporter.specFilter(spec);
	};

	$(document).ready(function () {
		jasmineEnv.execute();
	});
});

