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
						Math.pow(1 + 1 / Hyperiums7.timeToBuild[unitId][planet.raceId] / ttbMultiplier, numUnits) -
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
				numeral(numUnits).format('0,0'),
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

			if ($('.megaCurrentItem[href="/servlet/Fleets?pagetype=local_fleets"]').length == 1) {
				var planetId = parseFloat(element.attr('href').replace(/[^\d]+/g, '')),
					stasisIndicator = element.closest('table').find('td[width="100"]').eq(2).addClass('hc'),
					stasisButton = $('<input type="button" class="button">').
						mouseover(function () {
							var element = $(this);
							if (element.hasClass('highlight')) {
								element.val('Drop');
							} else {
								element.val('Enable');
							}
						}).
						mouseout(function () {
							var element = $(this);
							if (element.hasClass('highlight')) {
								element.val('Stasis');
							} else {
								element.val('No stasis');
							}
						}).
						click(function () {
							var element = $(this);
							if (element.hasClass('highlight')) {
								Hyperiums7.dropStasis(planetId).done(function () {
									element.removeClass('highlight').addClass('alert').val('No Stasis');
								});
							} else {
								Hyperiums7.enableStasis(planetId).done(function () {
									element.removeClass('alert').addClass('highlight').val('Stasis');
								});
							}
						});

				if (stasisIndicator.hasClass('flagStasis')) {
					stasisIndicator.removeClass('flagStasis');
					stasisButton.val('Stasis').addClass('highlight');
				} else {
					stasisButton.val('No stasis').addClass('alert');
				}

				stasisIndicator.empty().append(stasisButton);
			}
		});
	});
}

var fleetInfoData;
if ($('.megaCurrentItem[href="/servlet/Fleets?pagetype=local_fleets"]').length == 1) {
	fleetInfoData = 'own_planets';
} else if ($('.megaCurrentItem[href="/servlet/Fleets?pagetype=foreign_fleets"]').length == 1) {
	fleetInfoData = 'foreign_planets';
}

if (fleetInfoData) {
	Hyperiums7.getFleetsInfo({data: fleetInfoData}).done(function (planets) {
		$('.planetName').each(function (_, element) {
			element = $(element);
			var planetName = element.text(),
				raceStats = [];

			if (planets.toNames[planetName]) {
				$.each(planets.toNames[planetName].fleets, function (_, fleet) {
					if (fleet.isForeign) {
						return;
					}

					if (!raceStats[fleet.raceId]) {
						raceStats[fleet.raceId] = {
							numCarriedArmies: 0,
							numGroundArmies: 0,
							numArmyCapacity: 0
						};
					}
					
					raceStats[fleet.raceId].numCarriedArmies += fleet.numCarriedArmies || 0;
					raceStats[fleet.raceId].numGroundArmies += fleet.numGroundArmies || 0;
					raceStats[fleet.raceId].numArmyCapacity +=
						(fleet.numDestroyers || 0) * Hyperiums7.armyCapacity[1] +
						(fleet.numCruisers || 0) * Hyperiums7.armyCapacity[2] +
						(fleet.numScouts || 0) * Hyperiums7.armyCapacity[3] +
						(fleet.numBombers || 0) * Hyperiums7.armyCapacity[4] +
						(fleet.numStarbases || 0) * Hyperiums7.armyCapacity[5];
				});

				element.closest('table').
					closest('td').
					find('.bars').
					wrapAll('<td class="vt">').
					parent().
					wrap('<tr>').
					parent().
					append($('<td class="vt">').append(
						$('<table style="float:right">').append([
							$('<thead>').append(
								$('<tr class="stdArray">').append(function () {
									var cells = ['<td>Armies</td>'];
									$.each(Hyperiums7.races, function (_, raceName) {
										cells.push($('<th>').text(raceName));
									});
									return cells;
								})
							),
							$('<tbody>').append(function () {
								var rows = [], i = 0;
								$.each({
									numArmyCapacity: 'Capacity',
									numCarriedArmies: 'Carried',
									numGroundArmies: 'Ground'
								}, function (statKey, statName) {
									rows.push($('<tr>').
										addClass('line' + (++i % 2)).
										append(function () {
											var cells = [$('<th class="hl">').text(statName)];
											$.each(Hyperiums7.races, function (raceId, _) {
												if (raceStats[raceId] && raceStats[raceId][statKey]) {
													cells.push($('<td class="hr">').text(
														numeral(raceStats[raceId][statKey]).format('0[.]0a')
													))
												} else {
													cells.push('<td class="hr">-</td>');
												}
											});
											return cells;
										})
									);
								});
								return rows;
							})
						])
					)).
					wrap('<table style="width:100%">');
			}
		});
	});
}

if ($('.megaCurrentItem[href="/servlet/Fleets?pagetype=moving_fleets"]').length == 1) {
	Hyperiums7.getMovingFleetsFromHtml(document).done(function (fleets) {
		function formatPosition(position) {
			return '(' + position.x + ',' + position.y + ')';
		}
		
		function toggleAll() {
			var $this = $(this);
			$this
				.closest('tr')
				.nextUntil('.movingFleetGroupTitle')
				.find('input[type=checkbox]')
				.prop({ checked: $this.prop('checked') });
		}

		var $sortByEta = $('.banner [name=sortOrGroup').eq(0);
		var groupByEta = $sortByEta.length === 0 || $sortByEta.prop('disabled');
		var previousEta = null;
		$.each(fleets, function (_, fleet) {
			var distance = {
					x: fleet.to.x - fleet.from.x,
					y: fleet.to.y - fleet.from.y
				},
				eta = Math.max(Math.abs(distance.x), Math.abs(distance.y)) + 2,
				progress = 1 - (fleet.eta - fleet.delay) / eta;
				position = {
					x: Math.round(fleet.from.x + progress * distance.x),
					y: Math.round(fleet.from.y + progress * distance.y)
				};

			var $input = $('input[value="' + fleet.id + '"]');
			$input.parent().prev().append(
				'<br>From ', formatPosition(fleet.from),
				' to ', formatPosition(fleet.to),
				' @ ', formatPosition(position),
				' (', numeral(progress).format('0[.]0%'), ')'
			);
			
			if (groupByEta && previousEta != fleet.eta) {
				$input.closest('tr').before(
					$('<tr class="movingFleetGroupTitle"></tr>').append([
						$('<td></td>').append(
							$('<b></b>').text('ETA: ' + fleet.eta + ' hour(s) (incl. delay)')
						),
						$('<td class="hr"></td>').append(
							$('<input type="checkbox" class="checkbox" value>').click(toggleAll)
						)
					])
				);
			}
			
			previousEta = fleet.eta;
		});
	});
}

var currentPlanetName = $('.planetNameHuge').text();
if (currentPlanetName) {
	if ($('[name="unittype"]').length == 1) {
		fleetInfoData = 'own_planets';
	} else {
		fleetInfoData = 'foreign_planets';
	}
	Hyperiums7.getFleetsInfo({ data: fleetInfoData }).
		done(function (planets) {
			var total = {
				0: { defend: { space: 0, ground: 0 }, attack: { space: 0, ground: 0 }},
				1: { defend: { space: 0, ground: 0 }, attack: { space: 0, ground: 0 }},
				2: { defend: { space: 0, ground: 0 }, attack: { space: 0, ground: 0 }},
				3: { defend: { space: 0, ground: 0 }, attack: { space: 0, ground: 0 }},
				4: { defend: { space: 0, ground: 0 }, attack: { space: 0, ground: 0 }},
			};
			$.each(planets.toNames[currentPlanetName].fleets, function (_, fleet) {
				var stats = total[fleet.delay][fleet.defend ? 'defend' : 'attack'];
				Hyperiums7.updateFleetAvgP(fleet);
				stats.space += fleet.spaceAvgP;
				stats.ground += fleet.groundAvgP;
			});

			var table = $('<table><col></table>');
			$.each(total, function (na, _) {
				table.append('<col style="width:70px"/>');
			});

			var tr = $('<tr><th>N/A</th></tr>');
			$.each(total, function (na, _) {
				tr.append($('<td class="hr">').text(na));
			});
			table.append($('<thead>').append(tr));

			var i = 0;
			$.each({space: 'Space', ground: 'Ground'}, function (type, typeLabel) {
				$.each({defend: 'Defending', attack: 'Attacking'},
					function (mode, modeLabel) {
						var tr = $('<tr>').addClass('line' + (++i%2)).append($('<th>').text(
							modeLabel + ' ' + typeLabel + ' AvgP'));
						$.each(total, function (_, stats) {
							tr.append($('<td class="hr">').text(stats[mode][type] ?
								numeral(stats[mode][type]).format('0[.]0a') : '-'));
						});
						table.append(tr);
					});
			});

			$('.civ').parent().closest('table').after(table);
		});
}

if ($('#OwnPlGroups, #Groups').length == 1) {
	$('a.planetName').each(function () {
		var planetName = $(this).text();
		$(this).parent().append([
			'<br>',
			$('<button class="addToGroup" title="Use Define/Extend to confirm &amp; save">Add to group</button>')
				.click(function () {
					$('#OwnPlGroups, #Groups').show();
					var $listInput = $('input[name="listplanets"]');
					var list = $.trim($listInput.val());
					if (list.length) {
						list += ','
					}
	
					$listInput.val(list + planetName);
					$(this).hide();
				})
		]);
	});
}
 
