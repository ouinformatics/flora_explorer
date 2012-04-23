// Snippet to read task_id from URL
jQuery.extend({
	parseQuerystring: function() {
		var nvpair = {};
		var qs = window.location.search.replace('?', '');
		var pairs = qs.split('&');
		$.each(pairs, function(i, v) {
			var pair = v.split('=');
			nvpair[pair[0]] = pair[1];
		});
		return nvpair;
	}
});

$(function() {

	function serviceFill(settings) {
		template = settings.service
		template = template.replace('%db%', settings.db).
		replace('%col%', settings.col).
		replace('%query%', JSON.stringify(settings.query)).
		replace('%grouping%', settings.grouping).
		replace('%variable%', settings.variable)
		return template
	}

	function tecoGroupBy(settings) {
		var outData = {};
		var plotData = [];
		service = serviceFill(settings)
		$.getJSON(service, function(data) {
			$.each(data, function(i, item) {
				if (! (item.year in outData)) {
					outData[item.year] = {
						data: [],
						label: item.year
					};
				}
				outData[item.year].data.push([item[$('#aggregate').val()], item[$('#agmethod').val()] ]);
			});

			$.each(outData, function(key, value) {
				plotData.push(value);
			});
			doPlot(plotData, settings.plot_options);

		});
	}

	function tecoResults(settings) {
		var outData = [];
		query = JSON.stringify(settings.query);
		$.getJSON('http://test.cybercommons.org/mongo/db_find/' + settings.db + '/' + settings.col + '/' + query + '/?callback=?', function(data) {
			$.each(data, function(i, item) {
				outData.push([(new Date(item[settings.query.fields[0]])).getTime(), item[settings.query.fields[1]]]);
			});
			var plotDat = [];
			$.each(outData, function(key, value) {
				plotDat.push(value);
			});
			doPlot(plotDat, settings.plot_options);
		});
	}

	function getDateRange(task_id) {
		$.getJSON('http://test.cybercommons.org/mongo/db_find/' + settings.db + '/');
	}

	var tecovar = ['AirSpecificHumu', 'CO2concentratio', 'ET', 'LAI', 'LatentHeat', 'RootMoist', 'Runoff', 'SOM_Miro', 'SOM_Pass', 'SOM_SLOW', 'SoilWater', 'TairPlus273_15', 'Transpiration', 'carbon_Clitter', 'carbon_Flitter', 'carbon_Leaf', 'carbon_Root', 'carbon_Wood', 'carbon_biomass', 'carbon_canopy', 'carbon_soil', 'doy', 'gpp', 'hour', 'nee_observe', 'nee_simulate', 'npp', 'observed_date', 'rain_div_3600', 'resp_auto', 'resp_hetero', 'resp_tot', 'satfrac_1', 'satfrac_10', 'satfrac_2', 'satfrac_3', 'satfrac_4', 'satfrac_5', 'satfrac_6', 'satfrac_7', 'satfrac_8', 'satfrac_9', 'scale_sw', 'soilwater_1', 'soilwater_10', 'soilwater_2', 'soilwater_3', 'soilwater_4', 'soilwater_5', 'soilwater_6', 'soilwater_7', 'soilwater_8', 'soilwater_9', 'task_id', 'year'];

        var aggregates = ['month','week','day'];
        var agmethods = ['Sum','Avg','count'];

	function populateList(variables, selector) {
		$.each(variables, function(i, l) {
			selector.append($("<option/>").val(l).text(l));
		});
	}


	populateList(tecovar, $('#variable'));
        populateList(aggregates, $('#aggregate'));
        populateList(agmethods, $('#agmethod'));

	function tecoGroupByResult(task_id, grouping, variable) {

		var settings = {
			service: 'http://test.cybercommons.org/mongo/group_by/%db%/%col%/%grouping%/%variable%/%query%/?callback=?',
			db: 'teco',
			col: 'taskresults',
			grouping: grouping,
			query: {
				task_id: task_id
			},
			variable: variable,
			plot_options: {
				//xaxis: {
				//mode: "time",
				//timeformat: "%b %d, %y"
				//},
				//selection: {
				//	mode: 'x'
				//},
				lines: {
					show: true 
				},
				points: {
					show: false,
					fill: true,
					radius: 2,
					lineWidth: 1
				},
				grid: {
					clickable: true
				},
                                legend: { 
                                    container: $('#legend'),
                                    noColumns: 5
                                }
				//colors: ["rgba(130,181,255,0.7)"]
			}

		}
		return settings

	}
	test_settings = tecoGroupByResult('961d4f18-d88e-4cbd-8849-42a9a712ff82', '["year","day"]', 'npp')

	function tecoResult(task_id, year, doy_start, doy_stop, fields) {
		var settings = {
			service: 'http://test.cybercommons.org/mongo/db_find/%db%/%col%/%query%/?callback=?',
			db: 'teco',
			col: 'taskresults',
			query: {
				fields: fields,
				spec: {
					task_id: task_id,
					year: year,
					doy: {
						$gte: doy_start,
						$lte: doy_stop
					}
				}
			},
			plot_options: {
				xaxis: {
					mode: "time",
					timeformat: "%b %d, %y"
				},
				selection: {
					mode: 'x'
				},
				lines: {
					show: false
				},
				points: {
					show: true,
					fill: true,
					radius: 2,
					lineWidth: 1
				},
				grid: {
					clickable: true
				},
				colors: ["rgba(130,181,255,0.7)"]
            
			}
		};
		//tecoResults(settings);
		return settings
	}

	function compareYears(task_id, fields) {
		var settings = {
			db: 'teco',
			col: 'taskresults',
			query: {
				fields: fields,
				spec: {
					task_id: task_id
				}
			}
		}

	}

	function doPlot(data, options) {
		$.plot($('#plot'), data, options);
	}

	$('#plot').bind("plotselected", function(event, ranges) {
		$.plot($('#plot'), getData(ranges.xaxis.from, ranges.xaxis.to), $.extend(true, {},
		options, {
			xaxis: {
				min: ranges.xaxis.from,
				max: ranges.xaxis.to
			}
		}));
	});

	function updateUI() {
		
		tecoGroupBy(tecoGroupByResult(qs.task_id, '["year","'+$('#aggregate').val()+'"]', $('#variable').val()));
	}
	var qs = $.parseQuerystring();
	var fields = ['observed_date', 'npp'];
	if (typeof qs.task_id === 'undefined') {
		$('#plot').html('Please provide a task_id');
	}

	else {
		//tecoResult(qs.task_id, 2006, 0, 365, fields);
		$('#variable>option[value="npp"]').attr('selected',true);
                $('#agmethod>option[value="Sum"]').attr('selected',true);
                tecoGroupBy(tecoGroupByResult(qs.task_id, '["year","'+$('#aggregate').val()+'"]', $('#variable').val()));
		$('.updateOnChange').change(function() {
			updateUI();
		});

		/*$('#slider').slider({
			range: true,
			min: 1,
			max: 365,
			values: [0, 365],
			stop: function(event, ui) {
				updateUI();
			}
		});*/

	}

});

