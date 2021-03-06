/* ===================================================
 * flora.js
 *  31 May 2012
 * ===================================================
 * Copyright (c) 2012 University of Oklahoma
 *
 * console.log();
 * =================================================== */


//var verDate={"0":"2.1","1":"15 May 2012"};
//var verDate={"0":"2.2-Beta","1":"12 June 2012"};
//var verDate={"0":"2.3","1":"14 June 2012"};
//var verDate={"0":"2.4","1":"20 June 2012"};
//var verDate={"0":"2.5","1":"21 June 2012"};
//var verDate={"0":"2.6","1":"26 June 2012"};
//var verDate={"0":"2.7","1":"28 June 2012"};
//var verDate={"0":"2.8","1":"29 June 2012"};
//var verDate={"0":"2.95","1":"20 August 2012"};
//var verDate={"0":"2.97","1":"26 September 2012"};
var verDate = {"0": "3.00", "1": "05 September 2013"};

//Set url base need for application
//Please change these variables instead of urls in code
var floraBase = "/flora";
var mongoBase = "/mongo";
var florabibBase = "/florabib"
var staticBase = "";// not used
//*****************************************************

var map, options, floraLayer, selectControls, floraStyles;
var lay_osm, glayers
var sitesTotal = [], sitesActive = [], sitesSel = [];

var selnum = 0, saveselsites = [], saveseldata = [];
var plot_data = [], selplot_data = [], plotDesc = [], plotselDesc = [];
var savflg = 0;
var qry = '';
var enqry = '';
var states = {"AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "DC": "District/Columbia", "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland", "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York", "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina", "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming", "ALB": "Alberta", "BCL": "British Columbia", "CAN": "Canada", "MAN": "Manitoba", "NB": "New Brunswick", "NFL": "Newfoundland", "NS": "Nova Scotia", "NWT": "Northwest Territories", "ONT": "Ontario", "PEI": "Prince Edward Island", "QUE": "Quebec", "SAS": "Saskatchewan", "SPM": "Saint Pierre et Miquelon", "YUK": "Yukon"};
var stylesColor = {"0": "#0000ff", "1": "#b575b5", "2": "#f5914d", "3": "#bd2126", "4": "#8cba52", "5": "#8cc4d6", "6": "#007a63", "7": "#705421", "8": "#69c4ad", "9": "#008000", "10": "#000080", "11": "#800080", "12": "#c0c0c0"};

//on window load
$(window).load(function () {

	options = {
		spericalMercator: true,
		projection: new OpenLayers.Projection("EPSG:900913"),
		maxResolution: 156543.0339,
		maxZoomLevels: 18,
		displayProjection: new OpenLayers.Projection("EPSG:4326"),
		units: "m",
		maxExtent: new OpenLayers.Bounds([ -19803292.13, -5205054.49, 547896.95, 15497748.74 ])
	}
	map = new OpenLayers.Map('map', options);
	//ccbasemap = new OpenLayers.Layer.XYZ("Cybercommons Basemap", "http://129.15.41.144:8080/ccbasemap/${z}/${x}/${y}.png", { 'sphericalMercator': true });
	lay_osm = new OpenLayers.Layer.OSM('Open Street Map');
	glayers = [
		new OpenLayers.Layer.Google(
			"Google Physical",
			{type: google.maps.MapTypeId.TERRAIN}
		),
		new OpenLayers.Layer.Google(
			"Google Streets", // the default
			{numZoomLevels: 20}
		),
		new OpenLayers.Layer.Google(
			"Google Hybrid",
			{type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20}
		),
		//new OpenLayers.Layer.Google(
		//    "Google Satellite",
		//    {type: google.maps.MapTypeId.SATELLITE, numZoomLevels: 22}
		//),
		lay_osm
                //, ccbasemap
	];

	map.addLayers(glayers); //[ccbasemap,lay_osm] );


	center = new OpenLayers.LonLat(-100, 45);
	center = center.transform(options.displayProjection, options.projection);
	map.setCenter(center, 4);

	map.zoomToMaxExtent = function () {
		map.setCenter(center, 4);	//re-center if globe clicked
	};

	floraStyles = new OpenLayers.StyleMap({
		"default": new OpenLayers.Style({ fillOpacity: 1, pointRadius: 3.5, strokeWidth: 1, fillColor: "#8CBA52", graphicZIndex: 1 }),
		"select": new OpenLayers.Style({ fillOpacity: 1, fillColor: "#F6358A", graphicZIndex: 2 })
	});
	floraLayer = new OpenLayers.Layer.Vector("Flora Sites", {styleMap: floraStyles});

	$("#totmsg").show().html("Loading . . .");
	var st = [];
	$.getJSON(mongoBase + '/db_find/flora/data/{"fields":{"REF_NO":1,"Sitename":1,"State":1,"Year":1,"midlat":1,"midlon":1,"NO_Species":1,"Area_hectares":1,"NO_Tot_Taxa":1},"sort":[("REF_NO",1)]}?callback=?', function (fdata) {
		$.each(fdata, function (key, val) {
			sitesTotal.push(val);

			var point = new OpenLayers.Geometry.Point(val.midlon, val.midlat);
			point = point.transform(options.displayProjection, options.projection);
			var pointFeature = new OpenLayers.Feature.Vector(point, null, null);
			pointFeature.attributes = {"REF_NO": val.REF_NO, "Sitename": val.Sitename, "State": val.State, "Year": val.Year, "Area": val.Area_hectares, "Taxon": val.NO_Tot_Taxa};
			floraLayer.addFeatures(pointFeature);
			sitesActive.push(val.REF_NO);

			$.each(val.State, function (skey, sval) {
				if (sval && $.inArray(sval, st) === -1) {
					st.push(sval);
				}
			});

		}); //end each

		$.each(st.sort(), function (key, val) {
			if (states[val] != undefined) {
				$('#idstate').append('<option value=' + val + '>' + states[val] + '</option>');
				$('#State').append('<option value=' + val + '>' + states[val] + '</option>');
			}
		});

		$("#totmsg").html("<table width='100%'><tr><td>Total Sites: <b>" + sitesTotal.length + "</b></td><td style='text-align:right;'><a href='#' class='btn btn-info btn-mini' onclick='window.location.reload();'>Clear Selected</a></td></tr></table>");

	}); //end getJSON

	map.addLayer(floraLayer);

	map.addControl(new OpenLayers.Control.MousePosition({emptyString: "Floras Explorer"}));
	map.addControl(new OpenLayers.Control.LayerSwitcher());
	map.addControl(new OpenLayers.Control.ScaleLine());
	//map.addControl( new OpenLayers.Control.OverviewMap());

	selStyle = new OpenLayers.StyleMap({
		"default": new OpenLayers.Style({ display: 'none' })
	});
	var polygonLayer = new OpenLayers.Layer.Vector("Polygon Layer", {styleMap: selStyle});
	var circleLayer = new OpenLayers.Layer.Vector("Circle layer", {styleMap: selStyle});
	var boxLayer = new OpenLayers.Layer.Vector("Box layer", {styleMap: selStyle});
	map.addLayers([polygonLayer, circleLayer, boxLayer]);
	selectControls = { polygon: new OpenLayers.Control.DrawFeature(polygonLayer, OpenLayers.Handler.Polygon),
		circle: new OpenLayers.Control.DrawFeature(circleLayer, OpenLayers.Handler.RegularPolygon, { handlerOptions: { sides: 40 } }),
		box: new OpenLayers.Control.DrawFeature(boxLayer, OpenLayers.Handler.RegularPolygon, { handlerOptions: { sides: 4, irregular: true } }),
		select: new OpenLayers.Control.SelectFeature(floraLayer, { toggle: true })
	};

	for (var key in selectControls) {
		map.addControl(selectControls[key]);
		selectControls[key].events.register("featureadded", this, function (f) {
			$.each(floraLayer.features, function (key, val) {
				if (val.geometry.intersects(f.feature.geometry)) {
					onFeatureSelect(val);
					selectControls.select.highlight(val);
				}
			});
		});
	}

	document.getElementById("boxToggle").checked = true;
	selectControls.box.activate();

}); //end window Load

$(document).ready(function () {

	$("#map").resizable();

	$('#about').click(function () {
		if ($('#aboutAll').html() == null) {
			$("body").append('<div id="aboutAll"></div>');
			$("#aboutAll").dialog({ height: 700, width: 850, title: "<h3>About Floras Explorer</h3><h4>Version: " + verDate[0] + "</h4><h5>" + verDate[1] + "</h5>", close: function () {
				$("#aboutAll").remove();
			} });
			$('#aboutAll').load(floraBase + '/about.html');
		}
	});
	$('#contact').click(function () {
		if ($('#contactAll').html() == null) {
			$("body").append('<div id="contactAll"></div>');
			$("#contactAll").dialog({ height: 500, width: 850, title: "<h3>Floras Explorer Contact</h3><h4>Version: " + verDate[0] + "</h4><h5>" + verDate[1] + "</h5>", close: function () {
				$("#contactAll").remove();
			} });
			$("#contactAll").load(floraBase + '/contact.html');
		}
	});

	$('#help').click(function () {
		if ($('#helpAll').html() == null) {
			$("body").append('<div id="helpAll"></div>');
			$("#helpAll").dialog({ height: 500, width: 850, title: "<h3>How To Use Floras Explorer</h3><h4>Version: " + verDate[0] + "</h4><h5>" + verDate[1] + "</h5>", close: function () {
				$("#helpAll").remove();
			} });
			$("#helpAll").append('</br><b>Please click link for help:</b></br></br><a href="' + florabibBase + '/static/flora/user_guide.pdf" style="color:#2175A6;" target="_blank">Help and Instructions for Users</a> </br></br><b>Administration and Data Management</b></br></br><a href="' + florabibBase + '/admin" style="color:#2175A6;" target="_blank">Administration</a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="' + florabibBase + '/upload_data" style="color:#2175A6;" target="_blank">Data Management</a>');
		}
	});

	$("#advSearch").collapse()

	$('#advSrchBtn').click(function () {
		$("#advSearch").dialog('open');
	});

	$("#advSearch").dialog({ autoOpen: false, title: "Advanced Search", height: 800, width: 800, position: [400, 100],
		buttons: [
			{ text: "Close", class: "btn", click: function () {
				$(this).dialog("close");
			} },
			{ text: "Reset", class: "btn", click: function () {
				clearadvForm();
			} },
			{ text: "Search", class: "btn btn-success", click: function () {
				doAdvSearch();
				$(this).dialog("close");
			} }
		]
	});

	$("#selinfo").dialog({ autoOpen: false, height: 500, width: 800, position: [40, 50],
		close: function () {
			closesites();
		},
		buttons: [
			{ text: "Close", class: "btn", click: function () {
				$(this).dialog("close");
			} },
			{ text: "Save", class: "btn btn-success", click: function () {
				savesites();
				$(this).dialog("close");
			} }
		]
	});

	$("#searchState").click(function () {
		var selStates = $("#idstate").val() || [];
		var sstates = [];
		if (selStates != "") {
			$.each(selStates, function (key, value) {
				sstates.push('"' + value + '"');
			});
			searchState(sstates);
			$("#accordState").collapse('toggle');
		}
	});

	$("#searchText").click(function () {
		if ($("#txtsrch").val()) {
			searchText($("#txtsrch").val());
			$("#accordText").collapse('toggle');
		}
	});

	$("#txtsrch").keypress(function (event) {
		if (event.which == 13) {
			if ($("#txtsrch").val()) {
				searchText($("#txtsrch").val());
				$("#accordText").collapse('toggle');
			}
		}
	});

	// Fix login input element click problem
	$('.dropdown input, .dropdown label').click(function (e) {
		e.stopPropagation();
	});

}); //end document ready

function clearadvForm () {
	$('#advSearch :checked').each(function () {
		this.checked = false;
	});
	$('#advSearch :selected').each(function () {
		this.selected = false;
	});
	$('#advSearch :text').each(function () {
		$(this).val('');
	});
};

function toggleControl (element) {
	for (key in selectControls) {
		var control = selectControls[key];
		if (element.value == key && element.checked) {
			control.activate();
		} else {
			control.deactivate();
		}
	}
}

function onFeatureSelect (feature) {
	if (jQuery.inArray(feature.attributes.REF_NO, sitesSel) < 0) {
		sitesSel.push(feature.attributes.REF_NO);
		$("#sites tbody").append("<tr>" +
			"<td>" + feature.attributes.REF_NO + "</td>" +
			"<td><a style='color:#08C;' href='#' onclick='showbib(" + '"' + parseInt(feature.attributes.REF_NO) + '"' + ");'>" + feature.attributes.Sitename + "</a></td>" +
			"<td style='text-align:center;'>" + feature.attributes.Year + "</td>" +
			"<td style='text-align:right;'>" + feature.attributes.Area + "</td>" +
			"<td style='text-align:right;'>" + feature.attributes.Taxon + "</td>" +
			"</tr>"
		);
		$("#selname").val("Selected Sites " + sitesSel.length);
		$("#selinfo").dialog({ title: "" }).dialog('open');
	}
}
function executeFunctionWithCursor () {
	document.body.style.cursor = "wait";
	map.div.style.cursor = 'wait';
	setTimeout("doAdvSearch()", 1);
	setTimeout("document.body.style.cursor = 'auto';map.div.style.cursor='default';", 1);
}
function showbib (ref_no) {
	if ($("#bibAll" + ref_no).length < 1) {
		$("body").append('<div id="bibAll' + ref_no + '"></div>');
		$("#bibAll" + ref_no).dialog({ height: 'auto', width: 'auto', position: [300, 100], title: "<h3>Bib</h3>", close: function () {
			$("#bibAll" + ref_no).remove();
		} });
		$("#bibAll" + ref_no).append('<iframe id="iframe' + ref_no + '" src="' + florabibBase + '/' + ref_no + '" width="900" height="700"></iframe>');
	}
}
function setcursor () {
	if ($('body').css('cursor') == 'auto') {
		map.div.style.cursor = 'wait';
		$('body').css('cursor', 'wait');
	} else {
		map.div.style.cursor = 'default';
		$('body').css('cursor', 'auto');
	}

}
function refreshAll () {
	//refreshAll total sites
	sitesActive = [], sitesSel = [];
	$("#totmsg").show().html("Re-Loading . . .");
	floraLayer.destroyFeatures();

	$.each(sitesTotal, function (key, val) {
		var point = new OpenLayers.Geometry.Point(val.midlon, val.midlat);
		point = point.transform(options.displayProjection, options.projection);
		var pointFeature = new OpenLayers.Feature.Vector(point, null, null);
		pointFeature.attributes = {"REF_NO": val.REF_NO, "Sitename": val.Sitename, "State": val.State, "Year": val.Year, "Area": val.Area_hectares, "Taxon": val.NO_Tot_Taxa};
		floraLayer.addFeatures(pointFeature);
		sitesActive.push(pointFeature.attributes);
	});

	$("#totmsg").html("<table width='100%'><tr><td>Total Sites: <b>" + sitesTotal.length + "</b></td><td style='text-align:right;'><a href='#' class='btn btn-info btn-mini' onclick='window.location.reload();'>Clear Selected</a></td></tr></table>");
}

function savesites () {
	saveselsites[selnum] = sitesSel;
	saveseldata[selnum] = $("#sites tbody").clone();
	var name = $("#selname").val();

	if (selnum == 1) {
		$("#selAccordion").prepend("<div id='all' class='alert alert-info' style='text-align:center;'><b>ALL:</b> &nbsp; <a href='#' onclick='viewall();'>List Floras</a> &bull;  <a href='#' onclick='highlightall();'>Map Selection</a> &bull; <a href='#' onclick='plotall();'>Species-area relationship</a><div id='showPlotAll'></div></div>");
	}

	$("#selAccordion").append('\
			<div class="btn-toolbar">\
				<a class="close" data-dismiss="alert" onclick="closeSel(' + selnum + ');">x</a> \
				<div class="btn-group">\
					<button id="bname' + selnum + '" class="btn" style="color:' + stylesColor[selnum] + ';width:140px;">' + name + '</button>\
						<button class="btn dropdown-toggle" data-toggle="dropdown">\
						<span class="caret"></span>\
					</button>\
					<ul class="dropdown-menu">\
						<li><a href="#" onclick="selview(' + selnum + ');">List Floras</a></li>\
						<li><a href="#" onclick="selhighlight(' + selnum + ');">Map Selection</a></li>\
						<li><a href="#" onclick="selzoom(' + selnum + ');">Zoom to selected</a></li>\
						<li><a href="#" onclick="selextent(' + selnum + ');">Flora extent</a></li>\
						<li><a href="#" onclick="selplot(' + selnum + ');">Species-area relationship</a></li>\
						<li><a href="#" onclick="seldownld(' + selnum + ');">Download</a></li>\
	    			</ul>\
	    		</div>\
			</div>');

	selnum += 1;
	savflg = 1;
	unHighlightAll();
}

function closesites () {
	if (savflg) {
		//selected sites saved
		savflg = 0;
		sitesSel = [];
		$("#sites tbody").empty();
	} else {
		//selected sites closed
		sitesSel = [];
		$("#sites tbody").empty();
		unHighlightAll();
	}
}

function closeSel (i) {
	delete saveselsites[i];
	selnum -= 1;

	if (selnum == 1) {
		$("#all").hide();
	}
	if (selnum == 0) {
		saveselsites = [];
		unHighlightAll();
	}
}

function viewall () {
	$("#sites tbody").empty();
	var allsites = 0;
	for (i = 0; i <= saveselsites.length; i++) {
		$.each(floraLayer.features, function (key, val) {
			if (jQuery.inArray(val.attributes.REF_NO, saveselsites[i]) > -1) {
				allsites += 1;
				$("#sites tbody").append("<tr>" +
					"<td>" + val.attributes.REF_NO + "</td>" +
					"<td><a style='color:#08C;' href='#' onclick='showbib(" + '"' + parseInt(val.attributes.REF_NO) + '"' + ");'>" + val.attributes.Sitename + "</a></td>" +
					"<td style='text-align:center;'>" + val.attributes.Year + "</td>" +
					"<td style='text-align:right;'>" + val.attributes.Area + "</td>" +
					"<td style='text-align:right;'>" + val.attributes.Taxon + "</td>" +
					"</tr>"
				);
			}
		});
	}
	$("#seldivname").hide();
	$("#selinfo").dialog({ title: "ALL Selected Sites : " + allsites}).dialog('open');
}

function selview (i) {
	$("#sites tbody").empty();
	$("#sites").append(saveseldata[i]);
	$("#seldivname").hide();
	$("#selinfo").dialog({ title: $("#bname" + i).html() }).dialog('open');
}

function highlightall () {
	unHighlightAll();
	for (i = 0; i <= saveselsites.length; i++) {
		floraStyles.styles.select.defaultStyle.fillColor = stylesColor[i];
		$.each(floraLayer.features, function (key, val) {
			if (jQuery.inArray(val.attributes.REF_NO, saveselsites[i]) > -1) {
				selectControls.select.highlight(val);
			}
		});
	}
	floraStyles.styles.select.defaultStyle.fillColor = "#F6358A";
}

function selhighlight (i) {
	unHighlightAll();
	floraStyles.styles.select.defaultStyle.fillColor = stylesColor[i];
	$.each(floraLayer.features, function (key, val) {
		if (jQuery.inArray(val.attributes.REF_NO, saveselsites[i]) > -1) {
			selectControls.select.highlight(val);
		}
	});
	floraStyles.styles.select.defaultStyle.fillColor = "#F6358A";
}

function selzoom (i) {
	var lon = [], lat = [];
	$.each(sitesTotal, function (key, val) {
		if (jQuery.inArray(val.REF_NO, saveselsites[i]) > -1) {
			lon.push(val.midlon);
			lat.push(val.midlat);
		}
	});
	var lonmax = Math.max.apply(null, lon);
	var latmax = Math.max.apply(null, lat);
	var lonmin = Math.min.apply(null, lon);
	var latmin = Math.min.apply(null, lat);

	bounds = new OpenLayers.Bounds();
	bounds.extend(new OpenLayers.LonLat(lonmax, latmax));
	bounds.extend(new OpenLayers.LonLat(lonmin, latmin));
	bounds.transform(options.displayProjection, options.projection);
	map.zoomToExtent(bounds);
	selhighlight(i);
}

function selextent (i) {

	bbStyle = new OpenLayers.StyleMap({
		"default": new OpenLayers.Style({ fillOpacity: 0.2, fillColor: "#8CBA52" })
	});
	var name = $("#bname" + i).html();
	var bboxLayer = new OpenLayers.Layer.Vector(name, {styleMap: bbStyle});

	var points = [] , lon = [], lat = [];
	$.getJSON(mongoBase + '/db_find/flora/data/{"fields":{"REF_NO":1,"Latitude_N_edge":1,"Latitude_S_edge":1,"Longitude_E_edge":1,"Longitude_W_edge":1} }?callback=?', function (fdata) {
		$.each(fdata, function (key, val) {
			if (jQuery.inArray(val.REF_NO, saveselsites[i]) > -1) {
				lon.push(val.Longitude_W_edge);
				lon.push(val.Longitude_E_edge);
				lat.push(val.Latitude_S_edge);
				lat.push(val.Latitude_N_edge);
				var ppoints = [new OpenLayers.Geometry.Point(val.Longitude_W_edge, val.Latitude_S_edge),
					new OpenLayers.Geometry.Point(val.Longitude_W_edge, val.Latitude_N_edge),
					new OpenLayers.Geometry.Point(val.Longitude_E_edge, val.Latitude_N_edge),
					new OpenLayers.Geometry.Point(val.Longitude_E_edge, val.Latitude_S_edge)];
				var ring = new OpenLayers.Geometry.LinearRing(ppoints);
				ring = ring.transform(options.displayProjection, options.projection);
				var polygon = new OpenLayers.Geometry.Polygon([ring]);
				var bbox = new OpenLayers.Feature.Vector(polygon, null, null);
				points.push(bbox);
			}
		});
		var lonmax = Math.max.apply(null, lon);
		var latmax = Math.max.apply(null, lat);
		var lonmin = Math.min.apply(null, lon);
		var latmin = Math.min.apply(null, lat);
		bounds = new OpenLayers.Bounds();
		bounds.extend(new OpenLayers.LonLat(lonmax, latmax));
		bounds.extend(new OpenLayers.LonLat(lonmin, latmin));
		bounds.transform(options.displayProjection, options.projection);
		map.zoomToExtent(bounds);
		selhighlight(i);
		bboxLayer.addFeatures(points);
		map.addLayer(bboxLayer);
	});
}

function plotall () {
	plot_data = [], selplot_data = [], plotDesc = [], plotselDesc = [];
	$.each(sitesTotal, function (key, val) {
		var lh = Math.log(parseFloat(val.Area_hectares)) / Math.log(10);
		var ls = Math.log(parseFloat(val.NO_Species)) / Math.log(10);
		plotDesc.push(val);
		plot_data.push([ lh, ls ]);

		for (i = 0; i <= saveselsites.length; i++) {
			if (jQuery.inArray(val.REF_NO, saveselsites[i]) > -1) {
				plotselDesc.push(val);
				selplot_data.push([ lh, ls ]);
			}
		}
	});

	var plot_options = {lines: { show: false }, points: { show: true }, grid: {hoverable: true}, selection: { mode: "xy" },
		yaxis: { show: true, axisLabel: 'log10(NO_Species)', position: 'left' },
		xaxis: { show: true, axisLabel: 'log10(area)'} };

	var d1 = {color: "#8CBA52", data: plot_data };
	var d2 = {color: stylesColor[0], data: selplot_data };

	$("#selAccordion").append('<div id="plotinfoAll"><div id="plotAll" style="width:800px; height:450px;"></div></div>');
	$("#plotinfoAll").dialog({ height: 500, width: 850, title: "Plot All Data - total: " + plot_data.length + "  selected: " + selplot_data.length, close: function () {
		$("#plotinfoAll").remove();
	} });

	$("#plotAll").bind("plothover", function (event, pos, item) {
		if (item) {
			$("#tooltip").remove();
			var pinfo = '';
			if (item.seriesIndex == 0) {
				pinfo = "ID: " + plotDesc[item.dataIndex].REF_NO + "  " + plotDesc[item.dataIndex].Sitename;
			}
			if (item.seriesIndex == 1) {
				pinfo = "ID: " + plotselDesc[item.dataIndex].REF_NO + "  " + plotselDesc[item.dataIndex].Sitename;
			}
			showTooltip(item.pageX, item.pageY, pinfo);
		} else {
			$("#tooltip").remove();
		}
	});

	$("#plotAll").bind("plotselected", function (event, ranges) {
		plotselData(i, ranges.xaxis.from, ranges.xaxis.to, ranges.yaxis.from, ranges.yaxis.to);
	});

	$.plot($("#plotAll"), [d1, d2], plot_options);
}

function selplot (i) {
	plot_data = [], selplot_data = [], plotDesc = [], plotselDesc = [];
	$.each(sitesTotal, function (key, val) {
		var lh = Math.log(parseFloat(val.Area_hectares)) / Math.log(10);
		var ls = Math.log(parseFloat(val.NO_Species)) / Math.log(10);
		plotDesc.push(val);
		plot_data.push([ lh, ls ]);

		if (jQuery.inArray(val.REF_NO, saveselsites[i]) > -1) {
			plotselDesc.push(val);
			selplot_data.push([ lh, ls ]);
		}
	});

	var plot_options = {lines: { show: false }, points: { show: true }, grid: {hoverable: true}, selection: { mode: "xy" },
		yaxis: { show: true, axisLabel: 'log10(NO_Species)', position: 'left' },
		xaxis: { show: true, axisLabel: 'log10(area)'} };

	var d1 = {color: "#8CBA52", data: plot_data };
	var d2 = {color: stylesColor[i], data: selplot_data };

	$("#selAccordion").append('<div id="plotinfo' + i + '"><div id="plot' + i + '" style="width:800px; height:450px;"></div></div>');
	$("#plotinfo" + i).dialog({ height: 500, width: 850, title: "Plot Data - total: " + plot_data.length + "  selected: " + selplot_data.length, close: function () {
		$("#plotinfo" + i).remove();
	} });

	$("#plot" + i).bind("plothover", function (event, pos, item) {
		if (item) {
			$("#tooltip").remove();
			var pinfo = '';
			if (item.seriesIndex == 0) {
				pinfo = "ID: " + plotDesc[item.dataIndex].REF_NO + "  " + plotDesc[item.dataIndex].Sitename;
			}
			if (item.seriesIndex == 1) {
				pinfo = "ID: " + plotselDesc[item.dataIndex].REF_NO + "  " + plotselDesc[item.dataIndex].Sitename;
			}
			showTooltip(item.pageX, item.pageY, pinfo);
		} else {
			$("#tooltip").remove();
		}
	});

	$("#plot" + i).bind("plotselected", function (event, ranges) {
		plotselData(i, ranges.xaxis.from, ranges.xaxis.to, ranges.yaxis.from, ranges.yaxis.to);
	});

	$.plot($("#plot" + i), [d1, d2], plot_options);
}

function showTooltip (x, y, contents) {
	$('<div id="tooltip" style="z-index:3000">' + contents + '</div>').css({
		position: 'absolute',
		display: 'none',
		top: y + 5,
		left: x + 5,
		border: '1px solid #fdd',
		padding: '2px',
		'background-color': '#fee',
		opacity: 0.80
	}).appendTo("body").fadeIn(200);
}

function unHighlightAll () {
	$.each(floraLayer.features, function (key, val) {
		selectControls.select.unhighlight(val);
	});
}

function IsNumeric (input) {
	return (input - 0) == input && input.length > 0;
}

function plotselData (i, x1, x2, y1, y2) {
	var psel = [];
	$.each(selplot_data, function (key, val) {
		if (((x1 <= val[0]) && (x2 >= val[0])) && ((y1 <= val[1]) && (y2 >= val[1]))) {
			psel.push(plotselDesc[key].REF_NO + " " + plotselDesc[key].Sitename);
		}
	});
	$.each(plot_data, function (key, val) {
		if (((x1 <= val[0]) && (x2 >= val[0])) && ((y1 <= val[1]) && (y2 >= val[1]))) {
			if (jQuery.inArray(plotDesc[key].REF_NO + " " + plotDesc[key].Sitename, psel) < 0) {
				psel.push(plotDesc[key].REF_NO + " " + plotDesc[key].Sitename);
			}
		}
	});

	$("body").append('<div id="selplotData' + i + '"></div>');
	$("#selplotData" + i).dialog({ height: 200, width: 500, title: "Plot selection", close: function () {
		$("#selplotData" + i).remove();
	} });

	$.each(psel, function (key, val) {
		$("#selplotData" + i).append(val + "<br>");
	});

}

function selmodel (i) {
	$("body").append('\
		<div id="modeldata' + i + '">\
			<table id="model' + i + '" class="table table-striped table-bordered table-condensed">\
				<thead>\
					<tr class="ui-widget-header">\
						<th>REF NO</th>\
						<th>SITENAME</th>\
						<th style="text-align:right;">NUM SPECIES</th>\
						<th style="text-align:right;">CALCULATED SPECIES</th>\
					</tr>\
				</thead>\
				<tbody></tbody>\
			</table>\
		</div>');

	$.getJSON('http://fire.rccc.ou.edu/mongo/db_find/flora/model/{"fields":{"REF_NO":1,"Sitename":1,"NO_Species":1,"Est_NO_Species":1}}?callback=?', function (modeldata) {
		$.each(modeldata, function (key, val) {
			if (jQuery.inArray(val.REF_NO, saveselsites[i]) > -1) {
				$("#model" + i + " tbody").append("<tr>" +
					"<td>" + val.REF_NO + "</td>" +
					"<td><a style='color:#08C;' href='#' onclick='showbib(" + '"' + parseInt(val.REF_NO) + '"' + ");'>" + val.Sitename + "</a></td>" +
					"<td style='text-align:right;'>" + val.NO_Species + "</td>" +
					"<td style='text-align:right;'>" + val.Est_NO_Species.toFixed(2) + "</td>" +
					"</tr>"
				);
			}
		});
	});

	$("#modeldata" + i).dialog({ height: 500, width: 800, title: "Model Data - selected: " + saveselsites[i].length, close: function () {
		$("#modeldata" + i).remove();
	} });
}

function seldownld (i) {
	$("#selAccordion").append('<div id="downinfo' + i + '"></div>');
	$("#downinfo" + i).dialog({ height: 500, width: 850, title: "Download " + saveselsites[i].length + " sites", close: function () {
		$("#downinfo" + i).remove();
	} });
	$("#downinfo" + i).append('<br /><br /><b>Citations</b> &nbsp; (Use RIS for downloading to EndNote)<br /><br />');
	$("#downinfo" + i).append('<a style="color:#08C;" href="javascript:void(0);" onclick="download_post(\'ris\',' + String(i) + ');">RIS</a> &bull; ');
	$("#downinfo" + i).append('<a style="color:#08C;" href="javascript:void(0);" onclick="download_post(\'bibtex\',' + String(i) + ');">Bib Tex</a> <br/> ');
	$("#downinfo" + i).append('<br /><br /><b>Flora Data</b><br /><br />');
	$("#downinfo" + i).append('<a style="color:#08C;" href="javascript:void(0);" onclick="download_post(\'csv\',' + String(i) + ');">CSV</a> <br/> ');
}
//NEED TO REFACTOR ****************************************************************************************
function download_post (data_format, data_query) {
	if (data_format == 'csv') {
		var url = florabibBase + '/get_datafile'; //'http://test.cybercommons.org/tools/get_datafile/';
		var querys = '{"spec":{"REF_NO":{"$in":[' + saveselsites[parseInt(data_query)] + ']}}}';
	} else {
		var url = florabibBase + '/getbib'//'http://test.cybercommons.org/tools/getbib/';
		var querys = '{"spec":{"label":{"$in":[' + saveselsites[parseInt(data_query)] + ']}}}';
	}
	var data = { format: data_format, query: querys}
	form_post(url, data);
}
function form_post (url, data) {
	var form = document.createElement("form");
	form.setAttribute("method", "post");
	form.setAttribute("action", url);
	for (var key in data) {
		if (data.hasOwnProperty(key)) {
			var hiddenField = document.createElement("input");
			hiddenField.setAttribute("type", "hidden");
			hiddenField.setAttribute("name", key);
			hiddenField.setAttribute("value", data[key]);
			form.appendChild(hiddenField);
		}
	}
	document.body.appendChild(form);
	form.submit();
}
//*********************************************************************************************************
function searchState (sstates) {
	unHighlightAll();
	var sstates = sstates.join();
	$.each(floraLayer.features, function (key, val) {
		$.each(val.attributes.State, function (key2, val2) {
			val2 = '"' + val2 + '"';
			if (sstates.indexOf(val2) > -1) {
				onFeatureSelect(val)
				selectControls.select.highlight(val);
			}
		});
	});
}
function searchText (txtsrch) {
	unHighlightAll();
	if (IsNumeric(txtsrch)) {
		$.each(floraLayer.features, function (key, val) {
			if (txtsrch == val.attributes.REF_NO) {
				onFeatureSelect(val)
				selectControls.select.highlight(val);
			}
		});
	} else {
		$.each(floraLayer.features, function (key, val) {
			if (val.attributes.Sitename.toLowerCase().indexOf(txtsrch.toLowerCase()) > -1) {
				onFeatureSelect(val)
				selectControls.select.highlight(val);
			}
		});
	}
}
//Advanced Search============================================================================================
function doAdvSearch () {
	qry = '';
	enqry = '';
	var andor = 'and';

//Site Description==========================================================================================
	if ($('#Sitename').val()) {
		qry += "{'Sitename':{'$regex':'" + $('#Sitename').val() + "','$options':'i'}},";
	}

	if ($('#Year_min').val() || $('#Year_max').val()) {
		var yrmin = ($('#Year_min').val()) ? $('#Year_min').val() : 0;
		var yrmax = ($('#Year_max').val()) ? $('#Year_max').val() : 2012;
		qry += "{'Year':{'$gte':" + yrmin + ",'$lte':" + yrmax + "}},";
		enqry += "{'Year':{'$gte':" + yrmin + ",'$lte':" + yrmax + "}},";
	}

	var stvals = $("#State").val() || [];
	if (stvals.length > 0) {
		var sst = '"' + stvals.join('","') + '"';
		qry += "{'State':{'$in':[" + sst + "]}},";
	}

	var floradef = [];
	var Preservetype = [], preserveOther = 0;
	var Jurisdiction = [], jurisOther = 0;
	$('#advSearch :checked').each(function () {
		if ($(this).attr('id') == 'Flora_definition') {
			floradef.push($(this).val());
		}
		if ($(this).attr('id') == 'Preservetype') {
			if ($(this).val() == 'Other') {
				preserveOther = 1;
			}
			Preservetype.push($(this).val());
		}
		if ($(this).attr('id') == 'Jurisdiction') {
			if ($(this).val() == 'Other') {
				jurisOther = 1;
			}
			Jurisdiction.push($(this).val());
		}
	});

	if (floradef.length > 0) {
		var fdef = '"' + floradef.join('","') + '"';
		qry += "{'Flora_definition':{'$in':[" + fdef + "]}},";
	}

	if (Preservetype.length > 0) {
		if (preserveOther) {
			qry += "{'Preservetype':{'$nin':['Park','Forest','Wildlife Management','Wilderness','Natural Area - NRA','Recreation Area','Mixed','Monument','Experimental Site or Research Site','Wildlife Refuge','National Monument','Recreation']}},";
		} else {
			var ptyp = '"' + Preservetype.join('","') + '"';
			ptyp = ptyp.replace('Monument', 'Monument","National Monument');
			ptyp = ptyp.replace('Recreation Area', 'Recreation","Recreation Area');
			qry += "{'Preservetype':{'$in':[" + ptyp + "]}},";
		}
	}

	if (Jurisdiction.length > 0) {
		if (jurisOther) {
			qry += "{'Jurisdiction':{'$nin':['Federal','State','County','City','Private']}},";
		} else {
			var jtyp = '"' + Jurisdiction.join('","') + '"';
			qry += "{'Jurisdiction':{'$in':[" + jtyp + "]}},";
		}
	}

	if ($('#Physiographic').val()) {
		qry += "{'Physiographic':{'$regex':'" + $('#Physiographic').val() + "','$options':'i'}},";
	}

	if ($('#Habitat').val()) {
		qry += "{'Habitat':{'$regex':'" + $('#Habitat').val() + "','$options':'i'}},";
	}
	if ($('#datafilter').prop('checked')) {
		qry += "{'REF_NO':{'$ne':None}},";
	}

//Geographic Information====================================================================================
	if ($('#Area_hectares_min').val() || $('#Area_hectares_max').val()) {
		var armin = ($('#Area_hectares_min').val()) ? $('#Area_hectares_min').val() : 0;
		var armax = ($('#Area_hectares_max').val()) ? $('#Area_hectares_max').val() : 999999999;
		qry += "{'Area_hectares':{'$gte':" + armin + ",'$lte':" + armax + "}},";
	}

	if ($('#midlat_min').val() || $('#midlat_max').val()) {
		var mlatmin = ($('#midlat_min').val()) ? $('#midlat_min').val() : 20;
		var mlatmax = ($('#midlat_max').val()) ? $('#midlat_max').val() : 84;
		qry += "{'midlat':{'$gte':" + mlatmin + ",'$lte':" + mlatmax + "}},";
	}

	if ($('#midlon_min').val() || $('#midlon_max').val()) {
		var mlonmin = ($('#midlon_min').val()) ? $('#midlon_min').val() : -180;
		var mlonmax = ($('#midlon_max').val()) ? $('#midlon_max').val() : -50;
		qry += "{'midlon':{'$gte':" + mlonmin + ",'$lte':" + mlonmax + "}},";
	}

	if ($('#midelev_min').val() || $('#midelev_max').val()) {
		var melevmin = ($('#midelev_min').val()) ? $('#midelev_min').val() : -32;
		var melevmax = ($('#midelev_max').val()) ? $('#midelev_max').val() : 5000;
		qry += "{'midelev':{'$gte':" + melevmin + ",'$lte':" + melevmax + "}},";
	}

	if ($('#Latitude_S_edge_min').val() || $('#Latitude_S_edge_max').val()) {
		var latSmin = ($('#Latitude_S_edge_min').val()) ? $('#Latitude_S_edge_min').val() : 20;
		var latSmax = ($('#Latitude_S_edge_max').val()) ? $('#Latitude_S_edge_max').val() : 90;
		qry += "{'Latitude_S_edge':{'$gte':" + latSmin + ",'$lte':" + latSmax + "}},";
	}

	if ($('#Latitude_N_edge_min').val() || $('#Latitude_N_edge_max').val()) {
		var latNmin = ($('#Latitude_N_edge_min').val()) ? $('#Latitude_N_edge_min').val() : 20;
		var latNmax = ($('#Latitude_N_edge_max').val()) ? $('#Latitude_N_edge_max').val() : 90;
		qry += "{'Latitude_N_edge':{'$gte':" + latNmin + ",'$lte':" + latNmax + "}},";
	}

	if ($('#Longitude_W_edge_min').val() || $('#Longitude_W_edge_max').val()) {
		var lonWmin = ($('#Longitude_W_edge_min').val()) ? $('#Longitude_W_edge_min').val() : -180;
		var lonWmax = ($('#Longitude_W_edge_max').val()) ? $('#Longitude_W_edge_max').val() : -50;
		qry += "{'Longitude_W_edge':{'$gte':" + lonWmin + ",'$lte':" + lonWmax + "}},";
	}

	if ($('#Longitude_E_edge_min').val() || $('#Longitude_E_edge_max').val()) {
		var lonEmin = ($('#Longitude_E_edge_min').val()) ? $('#Longitude_E_edge_min').val() : -180;
		var lonEmax = ($('#Longitude_E_edge_max').val()) ? $('#Longitude_E_edge_max').val() : -50;
		qry += "{'Longitude_E_edge':{'$gte':" + lonEmin + ",'$lte':" + lonEmax + "}},";
	}

	if ($('#Min_Elev_m_min').val() || $('#Min_Elev_m_max').val()) {
		var minEmin = ($('#Min_Elev_m_min').val()) ? $('#Min_Elev_m_min').val() : -80;
		var minEmax = ($('#Min_Elev_m_max').val()) ? $('#Min_Elev_m_max').val() : 4200;
		qry += "{'Min_Elev_m':{'$gte':" + minEmin + ",'$lte':" + minEmax + "}},";
	}

	if ($('#Max_Elev_m_min').val() || $('#Max_Elev_m_max').val()) {
		var maxEmin = ($('#Max_Elev_m_min').val()) ? $('#Max_Elev_m_min').val() : 0;
		var maxEmax = ($('#Max_Elev_m_max').val()) ? $('#Max_Elev_m_max').val() : 6200;
		qry += "{'Max_Elev_m':{'$gte':" + maxEmin + ",'$lte':" + maxEmax + "}},";
	}

//Bibliographic Information=================================================================================
	var pubtype = [], pubtypeOther = 0;
	var kwords = [], kwordsOther = 0;
	$('#advSearch :checked').each(function () {
		if ($(this).attr('id') == 'Pubtype') {
			if ($(this).val() == 'other') {
				pubtypeOther = 1;
			}
			pubtype.push($(this).val());
		}
		if ($(this).attr('id') == 'Keywords') {
			if ($(this).val() == 'other') {
				kwordsOther = 1;
			}
			kwords.push($(this).val());
		}
	});

	if (pubtype.length > 0) {
		if (pubtypeOther) {
			qry += "{'Pubtype':{'$in':['internet resource','pamphlet','report','unpublished']}},";
		} else {
			var pbtyp = '"' + pubtype.join('","') + '"';
			qry += "{'Pubtype':{'$in':[" + pbtyp + "]}},";
		}
	}

	if ($('#Author').val()) {
		//enqry+="{'Author':{'$regex':'"+$('#Author').val()+"','$options':'i'}},";
		qry += "{'Author':{'$regex':'" + $('#Author').val() + "','$options':'i'}},";
	}

	if ($('#allEndnote').val()) {
		andor = 'or';
		qry += "{'Author':{'$regex':'" + $('#allEndnote').val() + "','$options':'i'}},";
		qry += "{'Journal':{'$regex':'" + $('#allEndnote').val() + "','$options':'i'}},";
		qry += "{'Keywords':{'$regex':'" + $('#allEndnote').val() + "','$options':'i'}},";
		qry += "{'ReferenceType':{'$regex':'" + $('#allEndnote').val() + "','$options':'i'}},";
		qry += "{'ShortTitle':{'$regex':'" + $('#allEndnote').val() + "','$options':'i'}},";
		qry += "{'Title':{'$regex':'" + $('#allEndnote').val() + "','$options':'i'}},";
		qry += "{'Year':{'$regex':'" + $('#allEndnote').val() + "','$options':'i'}},";
		/*
		 enqry+="{'Author':{'$regex':'"+$('#allEndnote').val()+"','$options':'i'}},";
		 enqry+="{'Journal':{'$regex':'"+$('#allEndnote').val()+"','$options':'i'}},";
		 enqry+="{'Keywords':{'$regex':'"+$('#allEndnote').val()+"','$options':'i'}},";
		 enqry+="{'ReferenceType':{'$regex':'"+$('#allEndnote').val()+"','$options':'i'}},";
		 enqry+="{'ShortTitle':{'$regex':'"+$('#allEndnote').val()+"','$options':'i'}},";
		 enqry+="{'Title':{'$regex':'"+$('#allEndnote').val()+"','$options':'i'}},";
		 enqry+="{'Year':{'$regex':'"+$('#allEndnote').val()+"','$options':'i'}},";
		 */
	}

	if ($('#REF_NO_min').val() || $('#REF_NO_max').val()) {
		var ref_nomin = ($('#REF_NO_min').val()) ? $('#REF_NO_min').val() : 0;
		var ref_nomax = ($('#REF_NO_max').val()) ? $('#REF_NO_max').val() : 23000;
		//qry+="{'REF_NO':{'$gte':"+ref_nomin+",'$lte':"+ref_nomax+"}},";
		//enqry+="{'Label':{'$gte':"+ref_nomin+",'$lte':"+ref_nomax+"}},";
		qry += "{'Label':{'$gte':" + ref_nomin + ",'$lte':" + ref_nomax + "}},";
	}

	if (kwords.length > 0) {
		if (kwordsOther) {
			//enqry+="{'Keywords':{'$nin':['Complete','Reject','Work in Progress']}},";
			qry += "{'Keywords':{'$nin':['Complete','Reject','Work in Progress']}},";
		} else {
			var ktyp = '"' + kwords.join('|') + '"';
			//enqry+="{'Keywords':{'$regex':"+ktyp+",'$options':'i'}},";
			qry += "{'Keywords':{'$regex':" + ktyp + ",'$options':'i'}},";
		}
	}

	//data QRY==================================================
	if (qry || enqry) {
		var expectedResponses = (qry && enqry) ? 2 : 1;
		var recs = [];
		var drecs = [];
		var erecs = [];
		var dups = [];
		$("#srchmsg").html("&nbsp;&nbsp;&nbsp;&nbsp;<font color='red'>Searching . . .</font>");
		$("#sites tbody").empty();
		$("#selname").val("Advanced Search");
		$("#selinfo").dialog('open');

		function mysort (data_A, data_B) {
			return (data_A.REF_NO - data_B.REF_NO);
		}

		function gotResponsesFromAllCalls () {
			$.each(drecs, function (key, val) {
				dups.push(val.REF_NO);
				recs.push({ "REF_NO": val.REF_NO, "Sitename": val.Sitename, "Year": val.Year, "Area_hectares": val.Area_hectares, "NO_Tot_Taxa": val.NO_Tot_Taxa });
			});
			$.each(erecs, function (key, val) {
				if (jQuery.inArray(val.REF_NO, dups) === -1) {
					recs.push({ "REF_NO": val.REF_NO, "Sitename": val.Sitename, "Year": val.Year, "Area_hectares": val.Area_hectares, "NO_Tot_Taxa": val.NO_Tot_Taxa });
				}
			});
			recs.sort(mysort)
			$.each(recs, function (key3, val3) {
				sitesSel.push(val3.REF_NO);
				$("#sites tbody").append("<tr>" +
					"<td>" + val3.REF_NO + "</td>" +
					"<td><a style='color:#08C;' href='#' onclick='showbib(" + '"' + parseInt(val3.REF_NO) + '"' + ");'>" + val3.Sitename + "</a></td>" +
					"<td style='text-align:center;'>" + val3.Year + "</td>" +
					"<td style='text-align:right;'>" + val3.Area_hectares + "</td>" +
					"<td style='text-align:right;'>" + val3.NO_Tot_Taxa + "</td>" +
					"</tr>"
				);
			});

			$("#srchmsg").html("&nbsp;&nbsp;&nbsp;&nbsp;" + sitesSel.length + " recs found.");
		};

		if (qry) {
			//var durl ="http://test.cybercommons.org/mongo/db_find/flora/data/{'spec': {'$"+andor+"': [ "+qry+" ]} ,'fields':['REF_NO','Sitename','State','Year','midlat','midlon','NO_Species','Area_hectares','NO_Tot_Taxa']}/?callback=?";
			var temp = qry.replace(/},{/g, ",");
			temp = temp.slice(0, temp.length - 1);
			//temp=temp.replace(/,,/g,",");
			//var durl ="http://test.cybercommons.org/mongo/db_find/flora/data/{'spec':"+temp+",'fields':['REF_NO','Sitename','State','Year','midlat','midlon','NO_Species','Area_hectares','NO_Tot_Taxa']}/?callback=?";
			var durl = mongoBase + "/db_find/flora/adv_search/{'spec':" + temp + ",'fields':['Label','ShortTitle','eYear','REF_NO','Sitename','State','Year','midlat','midlon','NO_Species','Area_hectares','NO_Tot_Taxa']}/?callback=?";
			$.getJSON(durl, function (data) {
				data.sort();
				$.each(data, function (key, val) {
					if (val.REF_NO != null) {
						drecs.push({ "REF_NO": val.REF_NO, "Sitename": val.Sitename, "Year": val.Year, "Area_hectares": val.Area_hectares, "NO_Tot_Taxa": val.NO_Tot_Taxa });
					} else {
						drecs.push({ "REF_NO": val.Label, "Sitename": val.ShortTitle, "Year": val.Year, "Area_hectares": "N/A", "NO_Tot_Taxa": "N/A" });
					}
				});
				//if (--expectedResponses == 0)
				gotResponsesFromAllCalls();
			}, "html");
		}

		if (enqry) {
                        //removed and combineded with qry
			//var eurl ="http://test.cybercommons.org/mongo/db_find/flora/endnote/{'spec': {'$"+andor+"': [ "+enqry+" ]} ,'fields':['ShortTitle','Label','Year']}/?callback=?";
			//var temp = enqry.replace(/},{/g, ",");
			//temp = temp.slice(0, temp.length - 1);
			//var eurl = "http://test.cybercommons.org/mongo/db_find/flora/endnote/{'spec':" + temp + ",'fields':['ShortTitle','Label','Year']}/?callback=?";
			/*$.getJSON(eurl, function(data2) {
			 data2.sort();
			 $.each(data2, function(key2,val2) {
			 erecs.push( { "REF_NO":val2.Label, "Sitename":val2.ShortTitle, "Year":val2.Year, "Area_hectares":"N/A", "NO_Tot_Taxa":"N/A" } );
			 });
			 if (--expectedResponses == 0)
			 gotResponsesFromAllCalls();
			 }, "html");*/
		}
	}
	//setcursor();
} //end doAdvSearch

/* End of flora.js =========================== */
