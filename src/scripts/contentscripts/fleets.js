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

$('td > input[name="loadarmies"]:not(:disabled)').after([
	' ',
	$('<input type="submit" class="button" name="randomLoadAll" value="Load All">')
]);

Hyperiums7.getControlledPlanets().done(function (planets) {
	var cash = parseFloat($('#cashTab').text().replace(/,/g, '')) || 0,
		factoryUnitId = Hyperiums7.units.indexOf('Factories');

	$('[name="build"]').
		after($('<p class="totals">')).
		click(function () {
			var form = $(this).closest('form');
			form.find('[name="buildunits"]').val(form.data('numUnits') || 0);
		});

	$('[name="buildunits"]').
		attr({
			type: 'number',
			min: 0
		}).
		css('width', '7em').
		keydown(function (event) {
			if (event.which == 13) {
				event.preventDefault();
				$(this).siblings('[name="build"]').click();
			}
		}).
		after([' ', $('<select name="xtype">').append([
			'<option value="numUnits">Units</option>',
			'<option value="spaceAvgP">Space AvgP</option>',
			'<option value="buildCosts">Build Costs</option>',
			'<option value="upkeepCosts">Upkeep Costs</option>',
			'<option value="numHours">Hours</option>'
		])]).
		add('[name="unittype"], [name="xtype"]').
		on('input change keyup', function () {
			var element = $(this),
				form = element.closest('form'),
				planetId = parseInt(form.find('[name="planetid"]').val()) || 0,
				planet = planets[planetId],
				unitId = parseInt(form.find('[name="unittype"]').val()) || 0,
				numUnits = parseFloat(form.find('[name="buildunits"]').val()) || 0,
				xtype = form.find('[name="xtype"]').val(),
				ttbMultiplier = Hyperiums7.getTimeToBuildMultiplier(planet),
				buildCostSpan;

			planet.numFactories = parseFloat(element.
				closest('tbody').
				children('tr').eq(1).
				find('b').eq(0).text());

			switch (xtype) {
			case 'numHours':
				if (unitId == factoryUnitId) {
					numUnits = planet.numFactories *
						Math.pow(1 + 1 / Hyperiums7.timeToBuild[unitId][planet.raceId] * ttbMultiplier, numUnits) -
						planet.numFactories;
				} else {
					numUnits *= planet.numFactories /
						Hyperiums7.timeToBuild[unitId][planet.raceId] /
						ttbMultiplier;
				}
				break;
			case 'spaceAvgP':
			case 'upkeepCosts':
				numUnits /= Hyperiums7[xtype][unitId][planet.raceId];
				break;
			case 'buildCosts':
				numUnits /= Hyperiums7[xtype][unitId][planet.productId];
				break;
			}

			numUnits = Math.floor(numUnits) || 0;
			form.data('numUnits', numUnits);

			var totals = Hyperiums7.getBuildPipeTotals([{
				count: numUnits,
				unitId: unitId
			}], planet);

			form.find('.totals').empty().append([
				'<strong>Units:</strong> ',
				numeral(numUnits).format('0[.]0a'),
				' - <strong>AvgP:</strong> ',
				numeral(totals.spaceAvgP).format('0[.]0a'),
				' - <strong>Costs:</strong> ',
				buildCostSpan = $('<span>').text(numeral(totals.buildCosts).format('0[.]0a')),
				' - <strong>Upkeep:</strong> ',
				numeral(totals.upkeepCosts).format('0[.]0a'),
				' - <strong>TTB:</strong> ',
				moment.duration(Math.ceil(totals.timeToBuild) * 3600000).format()
			]);

			if (totals.buildCosts > cash) {
				buildCostSpan.addClass('alertLight');
			}
		});
});

$('.movingFleetGroupTitle ~ tr img[src$="fleetarmy_icon.gif"]').
	each(function (_, element) {
		var numCarriedArmies = parseFloat(
				element.previousSibling.nodeValue.replace(/[^\d]+/g, '')
			),
			raceName = element.parentNode.firstChild.getAttribute('src').
				replace(/^.*?([a-z]+)\.gif$/i, '$1'),
			raceId = Hyperiums7.races.indexOf(raceName),
			avgP = Hyperiums7.groundAvgP[raceId] * numCarriedArmies;

		var td = $(element).
			closest('tr').
			prevAll('.movingFleetGroupTitle').first().
			find('b:last').
			parent();

		var prevAvgP = td.data('groundAvgP') || 0;
		if (prevAvgP == 0) {
			td.append(' - GAvgP: <b></b>');
		}
		avgP += prevAvgP;
		td.data('groundAvgP', avgP);

		td.find('b').last().text(numeral(avgP).format('0[.]0a'))
	});

$('[name="destplanetname"], [name="toplanet"], [name="destname"]').
	autocomplete({
		autoFocus: true,
		source: function (request, sendResponse) {
			Hyperiums7.searchPlanets(request.term).
				done(function (planets) {
					var names = [];
					$.each(planets, function (_, planet) {
						names.push(planet.name);
					});
					sendResponse(names);
				}).
				fail(function () {
					sendResponse([]);
				});
		}
	});

if ($('.megaCurrentItem[href="/servlet/Fleets?pagetype=factories"]').length == 0) {
	Hyperiums7.getMovingFleets().done(function (fleets) {
		var moveTick;
		$.each(Hyperiums7.ticks, function (_, tick) {
			if (tick.name == 'Move/Control') {
				moveTick = tick;
			}
		});

		var nextMoveTickDate = moveTick.getNextDate(new Date);

		$('.planetName').each(function (_, element) {
			element = $(element);
			var planet = { name: element.text() },
				total = {spaceAvgP: 0, groundAvgP: 0},
				table, numFleets;

			if (fleets.toNames[planet.name]) {
				numFleets = fleets.toNames[planet.name].length;
				table = $('<table class="stdArray" style="width:100%">').append([
					'<caption>Incoming</caption>',
					$('<thead>').append(
						$('<tr class="stdArray">').append([
							'<th class="hr">ETA</th>',
							'<th class="hc">ETA</th>',
							'<th class="hr">Space AvgP</th>',
							'<th class="hr">Ground AvgP</th>',
							'<th class="hc">Drop</th>',
							'<th class="hc">Change</th>',
							$('<th class="hr">').append(
								$('<input type="checkbox">').change(function () {
									var element = $(this);
									element.closest('table').
										find('tr:not(.stdArray) input').
										prop('checked', element.is(':checked'));
								})
							)
						])
					)
				]);

				$.each(fleets.toNames[planet.name], function (i, fleet) {
					Hyperiums7.updateFleetAvgP(fleet);
					total.spaceAvgP += fleet.spaceAvgP;
					total.groundAvgP += fleet.groundAvgP;
					table.append(
						$('<tr>').
							addClass('line' + ((i+1) % 2)).
							append([
								$('<td class="hr">').text(fleet.eta + 'h'),
								$('<td class="hc">').text(
									moment(nextMoveTickDate).
										add(fleet.eta - 1, 'h').
										utc().
										format('YYYY-MM-DD HH:mm')
								),
								$('<td class="hr">').text(numeral(fleet.spaceAvgP).format('0[.]0a')),
								$('<td class="hr">').text(numeral(fleet.groundAvgP).format('0[.]0a')),
								$('<td class="hc">').text(fleet.autodrop ? 'auto drop' : 'on order'),
								$('<td class="hc">').append(
									$('<a>Change</a>').attr('href',
										Hyperiums7.getServletUrl('Fleets?changefleet=&floatid=' + fleet.id)
									)
								),
								$('<td class="hr">').append(
									$('<input type="checkbox">').
										attr('name', 'reroute' + i).
										val(fleet.id)
								)
							]).
							mouseover(function () {
								$(this).addClass('lineCenteredOn');
							}).
							mouseout(function () {
								$(this).removeClass('lineCenteredOn');
							})
					);
				});

				if (numFleets > 1) {
					table.append(
						$('<tr class="stdArray">').append([
							'<td class="hr" colspan="2">Total</td>',
							$('<td class="hr">').text(numeral(total.spaceAvgP).format('0[.]0a')),
							$('<td class="hr">').text(numeral(total.groundAvgP).format('0[.]0a')),
							$('<td colspan="3">')
						])
					);
				}

				table.append(
					'<tr><td class="hr" colspan="7">' +
					'<input type="submit" class="button" name="reroute" value="Reroute"> ' +
					'<input type="submit" class="button" name="delayfleets" value="Delay"> ' +
					'selected fleets</td></tr>'
				);

				element.closest('table').parent().append(
					$('<form action="Fleets" method="post">').append(
						table,
						$('<input type="hidden" name="nbfleets">').val(numFleets)
					)
				);
			}
		});
	});
}

Hyperiums7.getControlledPlanets().done(function (planets) {
	Hyperiums7.getFleetsUpkeep().done(function (upkeep) {
		$('#htopmenu2').append($('<li>').append(
			$('<a href="Cash" class="megaTextItem">').append([
				'Deployed fleets: ',
				numeral(upkeep.numDeployed).format('0,0'),
				'/',
			numeral(5 * planets.numPlanets).format('0,0')
			])
		));
	});
});

