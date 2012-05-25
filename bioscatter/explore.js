function rgbToHex(R, G, B) {
	return '#' + toHex(R) + toHex(G) + toHex(B)
}
function toHex(n) {
	n = parseInt(n, 10);
	if (isNaN(n)) return "00";
	n = Math.max(0, Math.min(n, 255));
	return "0123456789ABCDEF".charAt((n - n % 16) / 16) + "0123456789ABCDEF".charAt(n % 16);
}

$(window).load(function() {
	function populateList(variables, selector) {
		$.each(variables, function(i, v) {
			selector.append($("<option/>").val(v).text(v));
		});
	}

	var task_id = "d067cc5f-73d4-4c61-a5eb-8073bf665f92";
	var datefmt = d3.time.format.utc('%Y%m%d.%H%M%S')
	var martin_roosts = function() {
		d3.json("http://test.cybercommons.org/mongo/distinct/bioscatter/pysal/properties.task_id/%7B%7D", function(tasks) {

			populateList(tasks, $('#task_id'));
		});
	}

	martin_roosts();
	// Map Setup
	var options = {
		spericalMercator: true,
		projection: new OpenLayers.Projection("EPSG:900913"),
		maxResolution: 156543.0339,
		maxZoomLevels: 18,
		displayProjection: new OpenLayers.Projection("EPSG:4326"),
		units: "m",
		maxExtent: new OpenLayers.Bounds([ - 19803292.13, - 5205054.49, 547896.95, 15497748.74]),
		center: new OpenLayers.LonLat( -97.4, 35.2).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913")),
		zoom: 9 
	}
	map = new OpenLayers.Map('map', options);
	ccbasemap = new OpenLayers.Layer.XYZ("ccbasemap", "http://129.15.41.144:8080/ccbasemap/${z}/${x}/${y}.png", {
		'sphericalMercator': true
	});
	url = "http://static.cybercommons.org/bioscatter/20100501.001500/${z}/${x}/${y}.png"
	var radar = new OpenLayers.Layer.XYZ("radar", url, {
		'sphericalMercator': true
	});
	radar.isBaseLayer = false;
	radar.visibility = true;
	radar.setOpacity(1.0)
	map.addLayer(radar)

	vectors = new OpenLayers.Layer.Vector("Polygons");
	vectors.style = new OpenLayers.Symbolizer.Polygon({
		fillColor: rgbToHex(245, 145, 77),
		fillOpacity: 0.5
	})
	var roostlyr = new OpenLayers.Layer.Vector("Roost", {});
	roostlyr.style = new OpenLayers.Symbolizer.Point({
		'pointRadius': 10,
		'fillColor': rgbToHex(181, 117, 181),
		'fillOpacity': 0.75,
		'strokeColor': rgbToHex(199, 148, 43),
		'zOrder': 100
	})
	map.addLayers([ccbasemap, vectors]);
	map.addControl(new OpenLayers.Control.LayerSwitcher({
		'ascending': false
	}));
	center = new OpenLayers.LonLat( - 97.4, 35.2);
	center = center.transform(options.displayProjection, options.projection);
	map.setCenter(center, 4);
	map.addControl(new OpenLayers.Control.MousePosition());

	//            url = "http://"+args.host+"/bioscatter/"+args.ts+"/${z}/${x}/${y}.png"
	//updateRadar({host:"static.cybercommons.org", ts: "20100526.202500"})
	var in_options = {
		'internalProjection': new OpenLayers.Projection("EPSG:900913"),
		'externalProjection': new OpenLayers.Projection("EPSG:4326")

	};

	function addGeoJSON(element) {
		var features = new OpenLayers.Format.GeoJSON(in_options).read(element);
		var bounds;
		if (features) {
			if (features.constructor != Array) {
				features = [features];
			}
			for (var i = 0; i < features.length; ++i) {
				if (!bounds) {
					bounds = features[i].geometry.getBounds();
				} else {
					bounds.extend(features[i].geometry.getBounds());
				}

			}

			vectors.addFeatures(features);
			//map.zoomToExtent(bounds);
			var plural = (features.length > 1) ? 's': '';
			element.value = features.length + ' feature' + plural + ' added';
		}

	}

	var mapPoly = function(poly) {
		addGeoJSON(poly);
	}

	var scatter = function(data) {
		var padding = 30;

		var w = 800 - (2 * padding),
		h = 400 - (2 * padding);

		var x = d3.time.scale.utc().range([0, w]).domain([d3.min(data, function(d) {
			return datefmt.parse(d.properties.timestep)
		}), d3.max(data, function(d) {
			return datefmt.parse(d.properties.timestep)
		})]),
		y = d3.scale.linear().range([h, 0]).domain([0, d3.max(data, function(d) {
			return d.properties.sum
		})])

		r = d3.scale.linear().range([0, 1]).domain([d3.min(data, function(d) {
			return d.properties.n
		}), d3.max(data, function(d) {
			return d.properties.n
		})]);

		xAxis = d3.svg.axis().scale(x);
		yAxis = d3.svg.axis().scale(y).orient('right');

		var g = d3.select("#mydiv").append("svg").attr('width', w + 2 * padding).attr('height', h + 2 * padding).attr("transform", "translate(" + padding + "," + padding + ")")

		g.append("svg:g").attr("class", "xaxis").attr("transform", "translate(0," + h + ")").call(xAxis)

		g.append("svg:g").attr("class", "yaxis").attr("transform", "translate(" + w + ",0)").call(yAxis)

		c = g.selectAll("circle").data(data).enter().append("circle");
		d3.selectAll("circle").attr("cx", function(d) {
			return x(datefmt.parse(d.properties.timestep))
		});
		d3.selectAll("circle").attr("cy", function(d) {
			return y(d.properties.sum)
		});
		d3.selectAll("circle").attr("r", function(d) {
			return r(d.properties.n) * 10
		});
		d3.selectAll("circle").attr("class", "plotpoint");
		d3.selectAll("circle").on("mouseover", function(d) {
			getGeom(d);
		}).on('mouseout', function(d) {})
	}

	var clearplot = function() {
		$('#mydiv').empty();
		vectors.removeAllFeatures();
		roostlyr.removeAllFeatures();
	}

	var setBounds = function(row) {
		var pos = row.properties.loc.split(",");
		var lat = pos[1];
		var lon = pos[0];

		// Set Bounds
		bounds = new OpenLayers.Bounds();
		bounds.extend(new OpenLayers.LonLat(lon - 1, lat - 1).transform(in_options.externalProjection, in_options.internalProjection));
		bounds.extend(new OpenLayers.LonLat(lon + 1, lat + 1).transform(in_options.externalProjection, in_options.internalProjection));
		map.zoomToExtent(bounds);
		map.center = new OpenLayers.LonLat(lon, lat).transform(in_options.externalProjection, in_options.internalProjection);

		// Add vector to indicate roost site.
		var roost = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(lon, lat).transform(in_options.externalProjection, in_options.internalProjection), null, null);
		map.addLayers([roostlyr]);
		roostlyr.addFeatures(roost)

	}

	var update = function(task_id) {
		d3.json("http://test.cybercommons.org/mongo/db_find/bioscatter/pysal/%7B'spec':%7B 'properties.task_id':'" + task_id + "'%7D,'fields':['properties']%7D", function(json) {
			clearplot();
			scatter(json);
			setBounds(json[0]);

		})
	}

	update(task_id);

	var getGeom = function(d) {
		var json;
		radar.url = "http://static.cybercommons.org/bioscatter/" + d.properties.timestep + "/${z}/${x}/${y}.png"
		radar.redraw();
		d3.json("http://test.cybercommons.org/mongo/db_find/bioscatter/pysal/{'spec':{'properties.task_id':'" + d.properties.task_id + "','properties.timestep': '" + d.properties.timestep + "','properties.tsid':" + d.properties.tsid + "},'fields': ['geometry','id','type']}?outtype=geojson", function(data) {
			mapPoly(data);
		});

		return (json);
	}
	$("#clearmap").click(function() {
		vectors.removeAllFeatures();
	});
	$("#task_id").change(function() {
		update($("#task_id").val())
	});

});

