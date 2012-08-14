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
var verDate={"0":"2.5","1":"21 June 2012"};

var map, options, floraLayer, selectControls, floraStyles;
var sitesTotal=[], sitesActive=[], sitesSel=[];

var selnum=0, saveselsites=[];
var plot_data=[], selplot_data=[], plotDesc=[], plotselDesc=[];
var savflg=0;
var advsrch=0;
var endnsrch=0;

var states = {"AL":"Alabama","AK":"Alaska","AZ":"Arizona","AR":"Arkansas","CA":"California","CO":"Colorado","CT":"Connecticut","DE":"Delaware","DC":"District/Columbia","FL":"Florida","GA":"Georgia","HI":"Hawaii","ID":"Idaho","IL":"Illinois","IN":"Indiana","IA":"Iowa","KS":"Kansas","KY":"Kentucky","LA":"Louisiana","ME":"Maine","MD":"Maryland","MA":"Massachusetts","MI":"Michigan","MN":"Minnesota","MS":"Mississippi","MO":"Missouri","MT":"Montana","NE":"Nebraska","NV":"Nevada","NH":"New Hampshire","NJ":"New Jersey","NM":"New Mexico","NY":"New York","NC":"North Carolina","ND":"North Dakota","OH":"Ohio","OK":"Oklahoma","OR":"Oregon","PA":"Pennsylvania","RI":"Rhode Island","SC":"South Carolina","SD":"South Dakota","TN":"Tennessee","TX":"Texas","UT":"Utah","VT":"Vermont","VA":"Virginia","WA":"Washington","WV":"West Virginia","WI":"Wisconsin","WY":"Wyoming","ALB":"Alberta","BCL":"British Columbia","CAN":"Canada","MAN":"Manitoba","NB":"New Brunswick","NFL":"Newfoundland","NS":"Nova Scotia","NWT":"Northwest Territories","ONT":"Ontario","PEI":"Prince Edward Island","QUE":"Quebec","SAS":"Saskatchewan","SPM":"Saint Pierre et Miquelon","YUK":"Yukon"};
var stylesColor={"0":"#0000ff","1":"#ff00ff","2":"#ffff00","3":"#ff0000","4":"#00ff00","5":"#00ffff","6":"#800000","7":"#808000","8":"#008080","9":"#008000","10":"#000080","11":"#800080","12":"#c0c0c0"};
var dkeys={"0":"Arbitrary","1":"Area_hectares","2":"Bot_effort","3":"Country","4":"Flora_definition","5":"Habitat","6":"Jurisdiction","7":"Latitude_N_edge","8":"Latitude_S_edge","9":"Longitude_E_edge","10":"Longitude_W_edge","11":"Max_Elev_m","12":"Min_Elev_m","13":"Physiographic","14":"Political","15":"Preservetype","16":"Pubtype","17":"REF_NO","18":"Remarks","19":"Sitename","20":"State","21":"Status","22":"Year","23":"midelev","24":"midlat","25":"midlon"};
var dkeytyp={"0":"s","1":"n","2":"n","3":"s","4":"s","5":"s","6":"s","7":"n","8":"n","0":"n","10":"n","11":"n","12":"n","13":"s","14":"s","15":"s","16":"s","17":"n","18":"s","19":"s","20":"as","21":"s","22":"n","23":"n","24":"n","25":"n"};

var enkeys={"0":"Author","1":"Journal","2":"Keywords","3":"Label","4":"Pages","5":"RecordNumber","6":"ReferenceType","7":"ShortTitle","8":"Title","9":"Volume","10":"Year"};
var enkeytyp={"0":"s","1":"s","2":"as","3":"n","4":"s","5":"n","6":"s","7":"s","8":"s","9":"s","10":"n"};

//on window load
$(window).load(function() {

	options = {
		spericalMercator : true,
		projection : new OpenLayers.Projection("EPSG:900913"),
		maxResolution : 156543.0339,
		maxZoomLevels : 18,
		displayProjection : new OpenLayers.Projection("EPSG:4326"),
		units : "m",
		maxExtent : new OpenLayers.Bounds([ -19803292.13,-5205054.49, 547896.95, 15497748.74 ])
	}
	map = new OpenLayers.Map('map', options);

	ccbasemap = new OpenLayers.Layer.XYZ("ccbasemap", "http://129.15.41.144:8080/ccbasemap/${z}/${x}/${y}.png", { 'sphericalMercator' : true });
	map.addLayer( ccbasemap );
	
	center = new OpenLayers.LonLat(-100, 45);
	center = center.transform(options.displayProjection,options.projection);
	map.setCenter(center, 4);
	
	map.zoomToMaxExtent= function(){
		map.setCenter(center, 4);	//re-center if globe clicked
    };

	floraStyles = new OpenLayers.StyleMap({
        "default": new OpenLayers.Style({ fillOpacity: 1, pointRadius: 3.5, strokeWidth: 1, fillColor: "#8CBA52", graphicZIndex: 1 }),
        "select": new OpenLayers.Style({ fillOpacity: 1, fillColor: "#F6358A", graphicZIndex: 2 })
    });
    floraLayer = new OpenLayers.Layer.Vector("Flora Sites", {styleMap: floraStyles});

	$("#totmsg").show() .html("Loading . . .");
	var st=[];
	$.getJSON('http://test.cybercommons.org/mongo/db_find/flora/data/{"fields":{"REF_NO":1,"Sitename":1,"State":1,"Year":1,"midlat":1,"midlon":1,"NO_Species":1,"Area_hectares":1,"NO_Tot_Taxa":1},"sort":[("REF_NO",1)]}?callback=?', function(fdata) {
		$.each(fdata, function(key,val) {
			sitesTotal.push(val);
			
			var point = new OpenLayers.Geometry.Point(val.midlon, val.midlat);
			point = point.transform(options.displayProjection,options.projection);
			var pointFeature = new OpenLayers.Feature.Vector(point, null, null);
			pointFeature.attributes = {"REF_NO": val.REF_NO, "Sitename": val.Sitename, "State": val.State, "Year": val.Year, "Area": val.Area_hectares, "Taxon": val.NO_Tot_Taxa};
			floraLayer.addFeatures(pointFeature);
			sitesActive.push(val.REF_NO);
			
			$.each(val.State, function(skey,sval) {
				if (sval && $.inArray(sval, st)===-1) {
					st.push(sval);
				}
			});
			
		}); //end each
				
		$.each(st.sort(), function(key, val) {
			$('#idstate').append('<option value='+val+'>'+states[val]+'</option>');
		});
		
		$("#totmsg").html("<table width='100%'><tr><td>Total Sites: <b>"+sitesTotal.length+"</b></td><td style='text-align:right;'><a href='#' class='btn btn-info btn-mini' onclick='window.location.reload();'>Clear Selected</a></td></tr></table>");

	}); //end getJSON

	map.addLayer( floraLayer );

	map.addControl( new OpenLayers.Control.MousePosition({emptyString:"Floras Explorer"} ) );
	map.addControl( new OpenLayers.Control.LayerSwitcher() );
	map.addControl( new OpenLayers.Control.ScaleLine() );
	map.addControl( new OpenLayers.Control.OverviewMap());
	
	selStyle = new OpenLayers.StyleMap({
		"default": new OpenLayers.Style({ display: 'none' })
    });	
    var polygonLayer = new OpenLayers.Layer.Vector("Polygon Layer", {styleMap: selStyle});
    var circleLayer =  new OpenLayers.Layer.Vector("Circle layer", {styleMap: selStyle});
    var boxLayer =     new OpenLayers.Layer.Vector("Box layer", {styleMap: selStyle});
    map.addLayers([polygonLayer,circleLayer,boxLayer]);
    selectControls = { polygon: new OpenLayers.Control.DrawFeature(polygonLayer, OpenLayers.Handler.Polygon),
    				 circle:  new OpenLayers.Control.DrawFeature(circleLayer,  OpenLayers.Handler.RegularPolygon, { handlerOptions: { sides: 40 } }),
    				 box:     new OpenLayers.Control.DrawFeature(boxLayer,     OpenLayers.Handler.RegularPolygon, { handlerOptions: { sides: 4, irregular: true } }),
    				 select:  new OpenLayers.Control.SelectFeature( floraLayer, { toggle: true } )
    };
    
    for(var key in selectControls) {
        map.addControl(selectControls[key]);
        selectControls[key].events.register("featureadded", this, function (f) {
    		$.each(floraLayer.features, function(key,val) {
    			if(val.geometry.intersects(f.feature.geometry)) {
    				onFeatureSelect(val);
    				selectControls.select.highlight(val);
    			}
    		});
        }); 
    }
    
	document.getElementById("boxToggle").checked=true;
	selectControls.box.activate();
   
}); //end window Load

$(document).ready( function() {

	$('#about').click(function(){
		$("body").append('<div id="aboutAll"></div>');
		$("#aboutAll").dialog({ height:700, width:850, title: "<h3>About Floras Explorer</h3><h4>Version: "+verDate[0]+"</h4><h5>"+verDate[1]+"</h5>", close: function() { $("#aboutAll").remove(); } });
		$('#aboutAll').load('http://test.cybercommons.org/flora/about.html');
    });
	
	$('#contact').click(function(){
		$("body").append('<div id="contactAll"></div>');
		$("#contactAll").dialog({ height:500, width:850, title: "<h3>Floras Explorer Contact</h3><h4>Version: "+verDate[0]+"</h4><h5>"+verDate[1]+"</h5>", close: function() { $("#contactAll").remove(); } });
		$("#contactAll").load('http://test.cybercommons.org/flora/contact.html');
	});
	
	$('#help').click(function(){
		$("body").append('<div id="helpAll"></div>');
		$("#helpAll").dialog({ height:500, width:850, title: "<h3>How To Use Floras Explorer</h3><h4>Version: "+verDate[0]+"</h4><h5>"+verDate[1]+"</h5>", close: function() { $("#helpAll").remove(); } });
		$("#helpAll").append('<p>Home</p><p>About</p><p>Contact</p><p>Search Options</p><p>State Search</p><p>Text Search</p><p>Advanced Search</p>');
	});
	
	$('#advance').click(function(){
		if ($("#advanceAll").length < 1) {
			$("body").append('<div id="advanceAll"></div>');
			$("#advanceAll").empty();
			$("#advanceAll").dialog({ height:500, width:850, title: "<h3>Advanced Search Options</h3>", 
				close: function() { advsrch=0; $("#advanceAll").remove(); },
				 buttons: [{ text: "Add", class: "btn btn-info", click: function() { addadvSearchLine(); } },
				           { text: "Close", class: "btn", click: function() { advsrch=0; $("#advanceAll").remove(); } },
				           { text: "Search",  class: "btn btn-success", click: function() { advanceSearch(); } } ] });
			addadvSearchLine();
		}
	});

	$('#endnote').click(function(){
		if ($("#endnoteAll").length < 1) {
			$("body").append('<div id="endnoteAll"></div>');
			$("#endnoteAll").empty();
			$("#endnoteAll").dialog({ height:500, width:850, title: "<h3>EndNote Search Options</h3>", 
				close: function() { endnsrch=0; $("#endnoteAll").remove(); },
				buttons: [{ text: "Add", class: "btn btn-info", click: function() { addendnoteSearchLine(); } },
				          { text: "Close", class: "btn", click: function() { endnsrch=0; $("#endnoteAll").remove(); } },
				          { text: "Search",  class: "btn btn-success", click: function() { endnoteSearch(); } } ] });
			addendnoteSearchLine();
		}
	});
	
	$("#map").resizable();

	$("#selinfo").dialog({ autoOpen:false, height:500, width:800, position: [40,50],
		 close: function() { closesites(); },
		 buttons: [{ text: "Close", class: "btn", click: function() { $(this).dialog("close"); } },
		           { text: "Save",  class: "btn btn-success", click: function() { savesites(); $(this).dialog("close"); } } ] });
	
	$("#searchState").click(function() {
    	var selStates = $("#idstate").val() || [];   	
    	var sstates=[];
    	if (selStates != "") {
	    	$.each(selStates, function(key, value) {
	    		sstates.push('"'+value+'"');
	    	});
	    	searchState (sstates);
	    	$("#accordState").collapse('toggle');
    	}
	});

	$("#searchText").click(function() {
		if ( $("#txtsrch").val() ) {
			searchText($("#txtsrch").val());
			$("#accordText").collapse('toggle');
		}
	});

	$("#txtsrch").keypress(function(event) {
		  if ( event.which == 13 ) {
				if ( $("#txtsrch").val() ) {
					searchText($("#txtsrch").val());
					$("#accordText").collapse('toggle');
				}
		   }
	});

	// Fix login input element click problem
	$('.dropdown input, .dropdown label').click(function(e) {
		e.stopPropagation();
	});
	  
}); //end document ready

function toggleControl(element) {
    for(key in selectControls) {
        var control = selectControls[key];
        if(element.value == key && element.checked) {
            control.activate();
        } else {
            control.deactivate();
        }
    }
}

function onFeatureSelect(feature) {
	if (jQuery.inArray(feature.attributes.REF_NO, sitesSel) < 0) {
		sitesSel.push(feature.attributes.REF_NO);
		$( "#sites tbody" ).append( "<tr>" + 
				"<td>" + feature.attributes.REF_NO + "</td>" + 
				"<td><a style='color:#08C;' href='#' onclick='showbib("+'"'+parseInt(feature.attributes.REF_NO)+'"'+");'>" + feature.attributes.Sitename + "</a></td>" +
				"<td style='text-align:center;'>" + feature.attributes.Year + "</td>" + 
				"<td style='text-align:right;'>" + feature.attributes.Area + "</td>" + 
				"<td style='text-align:right;'>" + feature.attributes.Taxon + "</td>" + 
				"</tr>"
		); 
		$("#selname").val("Selected Sites "+sitesSel.length);
		$("#selinfo").dialog({ title: "" }).dialog('open');
	}
}

function showbib(ref_no) {
	if ($("#bibAll"+ref_no).length < 1) {
		$("body").append('<div id="bibAll'+ref_no+'"></div>');
		$("#bibAll"+ref_no).dialog({ height:'auto', width:'auto', position: [300,100], title: "<h3>Bib</h3>", close: function() { $("#bibAll"+ref_no).remove(); } });
		$("#bibAll"+ref_no).append('<iframe id="iframe'+ref_no+'" src="http://test.cybercommons.org/florabib/'+ref_no+'" width="900" height="700"></iframe>');
	}
}

function refreshAll() {
	//refreshAll total sites
	sitesActive=[], sitesSel=[];
	$("#totmsg").show() .html("Re-Loading . . .");
	floraLayer.destroyFeatures();
	
	$.each(sitesTotal, function(key,val) {
		var point = new OpenLayers.Geometry.Point(val.midlon, val.midlat);
		point = point.transform(options.displayProjection,options.projection);
		var pointFeature = new OpenLayers.Feature.Vector(point, null, null);
		pointFeature.attributes = {"REF_NO": val.REF_NO, "Sitename": val.Sitename, "State": val.State, "Year": val.Year, "Area": val.Area_hectares, "Taxon": val.NO_Tot_Taxa};
		floraLayer.addFeatures(pointFeature);
		sitesActive.push(pointFeature.attributes);
	}); 

	$("#totmsg").html("<table width='100%'><tr><td>Total Sites: <b>"+sitesTotal.length+"</b></td><td style='text-align:right;'><a href='#' class='btn btn-info btn-mini' onclick='window.location.reload();'>Clear Selected</a></td></tr></table>");
}

function savesites() {
	saveselsites[selnum]=sitesSel;
	
	var name = $("#selname").val();
	
	if (selnum == 1) {
		$("#selAccordion").prepend("<div id='all' class='alert alert-info' style='text-align:center;'><b>ALL:</b> &nbsp; <a href='#' onclick='viewall();'>List Floras</a> &bull;  <a href='#' onclick='highlightall();'>Map Selection</a> &bull; <a href='#' onclick='plotall();'>Plot</a><div id='showPlotAll'></div></div>");
	}
	
	$("#selAccordion").append('\
			<div class="btn-toolbar">\
				<a class="close" data-dismiss="alert" onclick="closeSel('+selnum+');">x</a> \
				<div class="btn-group">\
					<button id="bname'+selnum+'" class="btn" style="color:'+stylesColor[selnum]+';width:140px;">'+name+'</button>\
						<button class="btn dropdown-toggle" data-toggle="dropdown">\
						<span class="caret"></span>\
					</button>\
					<ul class="dropdown-menu">\
						<li><a href="#" onclick="selview('+selnum+');">List Floras</a></li>\
						<li><a href="#" onclick="selhighlight('+selnum+');">Map Selection</a></li>\
						<li><a href="#" onclick="selzoom('+selnum+');">Zoom</a></li>\
						<li><a href="#" onclick="selplot('+selnum+');">Plot</a></li>\
						<li><a href="#" onclick="seldownld('+selnum+');">Download</a></li>\
	    			</ul>\
	    		</div>\
			</div>');

	selnum += 1;
	savflg=1;
	unHighlightAll();
}	

function closesites() {
	if (savflg){
		//selected sites saved
		savflg=0;
		sitesSel=[];
		$("#sites tbody").empty();
	}else{
		//selected sites closed
		sitesSel=[];
		$("#sites tbody").empty();
		unHighlightAll();
	}
}	

function closeSel(i) {
	delete saveselsites[i];
	selnum -= 1;

	if (selnum == 1) {
		$("#all").hide();
	}
	if (selnum == 0) {
		saveselsites=[];
		unHighlightAll();
	}
}

function viewall() {
	$("#sites tbody").empty();
	var allsites=0;
	for (i=0;i<=saveselsites.length;i++) {
		$.each(floraLayer.features, function(key,val) {
			if (jQuery.inArray(val.attributes.REF_NO, saveselsites[i]) > -1) {
				allsites += 1;
				$( "#sites tbody" ).append( "<tr>" + 
						"<td>" + val.attributes.REF_NO + "</td>" + 
						"<td><a style='color:#08C;' href='#' onclick='showbib("+'"'+parseInt(val.attributes.REF_NO)+'"'+");'>" + val.attributes.Sitename + "</a></td>" +
						"<td style='text-align:center;'>" + val.attributes.Year + "</td>" + 
						"<td style='text-align:right;'>" + val.attributes.Area + "</td>" + 
						"<td style='text-align:right;'>" + val.attributes.Taxon + "</td>" + 
						"</tr>"
				); 
			}
		});
	}
	$("#seldivname").hide();
	$("#selinfo").dialog({ title: "ALL Selected Sites : "+allsites}).dialog('open');
}

function selview(i) {
	$("#sites tbody").empty();
	$.each(floraLayer.features, function(key,val) {
		if (jQuery.inArray(val.attributes.REF_NO, saveselsites[i]) > -1) {
			$( "#sites tbody" ).append( "<tr>" + 
					"<td>" + val.attributes.REF_NO + "</td>" + 
					"<td><a style='color:#08C;' href='#' onclick='showbib("+'"'+parseInt(val.attributes.REF_NO)+'"'+");'>" + val.attributes.Sitename + "</a></td>" +
					"<td style='text-align:center;'>" + val.attributes.Year + "</td>" + 
					"<td style='text-align:right;'>" + val.attributes.Area + "</td>" + 
					"<td style='text-align:right;'>" + val.attributes.Taxon + "</td>" + 
					"</tr>"
			); 
		}
	});
	$("#seldivname").hide();
	$("#selinfo").dialog({ title: $("#bname"+i).html() }).dialog('open');
}

function highlightall() {
	unHighlightAll();
	for (i=0;i<=saveselsites.length;i++) {
		floraStyles.styles.select.defaultStyle.fillColor=stylesColor[i];
		$.each(floraLayer.features, function(key,val) {
			if (jQuery.inArray(val.attributes.REF_NO, saveselsites[i]) > -1) {
				selectControls.select.highlight(val);
			}
		});
	}
	floraStyles.styles.select.defaultStyle.fillColor="#F6358A";
}

function selhighlight(i) {
	unHighlightAll();
	floraStyles.styles.select.defaultStyle.fillColor=stylesColor[i];
	$.each(floraLayer.features, function(key,val) {
		if (jQuery.inArray(val.attributes.REF_NO, saveselsites[i]) > -1) {
			selectControls.select.highlight(val);
		}
	});
	floraStyles.styles.select.defaultStyle.fillColor="#F6358A";
}

function selzoom(i) {
	var lon=[], lat=[];
	$.each(sitesTotal, function(key,val) {
		if (jQuery.inArray(val.REF_NO, saveselsites[i]) > -1) {
			lon.push(val.midlon);
			lat.push(val.midlat);
		}
	}); 
	var lonmax = Math.max.apply( null, lon );
	var latmax = Math.max.apply( null, lat );
	var lonmin = Math.min.apply( null, lon );
	var latmin = Math.min.apply( null, lat );

	bounds = new OpenLayers.Bounds();
	bounds.extend(new OpenLayers.LonLat(lonmax,latmax));
	bounds.extend(new OpenLayers.LonLat(lonmin,latmin));
	bounds.transform(options.displayProjection,options.projection);
	map.zoomToExtent(bounds);
	selhighlight(i);

}

function plotall() {
	plot_data=[], selplot_data=[], plotDesc=[], plotselDesc=[];
	$.each(sitesTotal, function(key, val) {
		var lh=Math.log(parseFloat(val.Area_hectares)) / Math.log(10);
		var ls=Math.log(parseFloat(val.NO_Species)) / Math.log(10);
		plotDesc.push(val);
		plot_data.push([ lh, ls ]);
		
		for (i=0;i<=saveselsites.length;i++) {
			if (jQuery.inArray(val.REF_NO, saveselsites[i]) > -1) {
				plotselDesc.push(val);
				selplot_data.push([ lh, ls ]);
			}
		}
	});
	
	var plot_options={lines: { show: false }, points: { show: true }, grid:{hoverable: true}, selection: { mode: "xy" }, 
			yaxis : { show : true, axisLabel : 'log10(NO_Species)', position: 'left' },
			xaxis : { show : true, axisLabel : 'log10(area)'} };
	
	var d1 = {color: "#8CBA52", data: plot_data };			
	var d2 = {color: stylesColor[0], data: selplot_data };	
	
	$("#selAccordion").append('<div id="plotinfoAll"><div id="plotAll" style="width:800px; height:450px;"></div></div>');
	$("#plotinfoAll").dialog({ height:500, width:850, title: "Plot All Data - total: "+plot_data.length+"  selected: "+selplot_data.length, close: function() { $("#plotinfoAll").remove(); } });
	
    $("#plotAll").bind("plothover", function (event, pos, item) {
        if (item) {
        	$("#tooltip").remove();
        	var pinfo='';
        	if (item.seriesIndex==0) {
        		pinfo = "ID: "+plotDesc[item.dataIndex].REF_NO+"  "+plotDesc[item.dataIndex].Sitename;
        	}
        	if (item.seriesIndex==1) {
        		pinfo = "ID: "+plotselDesc[item.dataIndex].REF_NO+"  "+plotselDesc[item.dataIndex].Sitename;
        	}
        	showTooltip(item.pageX, item.pageY, pinfo);
        }else{
        	$("#tooltip").remove();
        }     
    });

    $("#plotAll").bind("plotselected", function (event, ranges) {
    	plotselData(i, ranges.xaxis.from, ranges.xaxis.to, ranges.yaxis.from, ranges.yaxis.to);
    });
    
	$.plot($("#plotAll"), [d1,d2], plot_options);
}

function selplot(i) {
	plot_data=[], selplot_data=[], plotDesc=[], plotselDesc=[];
	$.each(sitesTotal, function(key, val) {
		var lh=Math.log(parseFloat(val.Area_hectares)) / Math.log(10);
		var ls=Math.log(parseFloat(val.NO_Species)) / Math.log(10);
		plotDesc.push(val);
		plot_data.push([ lh, ls ]);
		
		if (jQuery.inArray(val.REF_NO, saveselsites[i]) > -1) {
			plotselDesc.push(val);
			selplot_data.push([ lh, ls ]);
		}
	});

	var plot_options={lines: { show: false }, points: { show: true }, grid:{hoverable: true}, selection: { mode: "xy" }, 
			yaxis : { show : true, axisLabel : 'log10(NO_Species)', position: 'left' },
			xaxis : { show : true, axisLabel : 'log10(area)'} };
	
	var d1 = {color: "#8CBA52", data: plot_data };			
	var d2 = {color: stylesColor[i], data: selplot_data };	

	$("#selAccordion").append('<div id="plotinfo'+i+'"><div id="plot'+i+'" style="width:800px; height:450px;"></div></div>');
	$("#plotinfo"+i).dialog({ height:500, width:850, title: "Plot Data - total: "+plot_data.length+"  selected: "+selplot_data.length, close: function() { $("#plotinfo"+i).remove(); } });

    $("#plot"+i).bind("plothover", function (event, pos, item) {
        if (item) {
        	$("#tooltip").remove();
        	var pinfo='';
        	if (item.seriesIndex==0) {
        		pinfo = "ID: "+plotDesc[item.dataIndex].REF_NO+"  "+plotDesc[item.dataIndex].Sitename;
        	}
        	if (item.seriesIndex==1) {
        		pinfo = "ID: "+plotselDesc[item.dataIndex].REF_NO+"  "+plotselDesc[item.dataIndex].Sitename;
        	}
        	showTooltip(item.pageX, item.pageY, pinfo);
        }else{
        	$("#tooltip").remove();
        }     
    });

    $("#plot"+i).bind("plotselected", function (event, ranges) {
    	plotselData(i, ranges.xaxis.from, ranges.xaxis.to, ranges.yaxis.from, ranges.yaxis.to);
    });
    
	$.plot($("#plot"+i), [d1,d2], plot_options);
}

function showTooltip(x, y, contents) {
    $('<div id="tooltip" style="z-index:3000">' + contents + '</div>').css( {
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

function plotselData(i, x1, x2, y1, y2) {
	var psel=[];
	$.each(selplot_data, function(key, val) { 
		if ( ((x1 <= val[0]) && (x2 >= val[0])) && ((y1 <= val[1]) && (y2 >= val[1])) ) {
			psel.push(plotselDesc[key].REF_NO+" "+plotselDesc[key].Sitename);
		}
	});
	$.each(plot_data, function(key, val) { 
		if ( ((x1 <= val[0]) && (x2 >= val[0])) && ((y1 <= val[1]) && (y2 >= val[1])) ) {
			if (jQuery.inArray(plotDesc[key].REF_NO+" "+plotDesc[key].Sitename, psel) < 0) {
				psel.push(plotDesc[key].REF_NO+" "+plotDesc[key].Sitename);
			}
		}
	});
	
	$("body").append('<div id="selplotData'+i+'"></div>');
	$("#selplotData"+i).dialog({ height:200, width:500, title: "Plot selection", close: function() { $("#selplotData"+i).remove(); } });

	$.each(psel, function(key, val) { 
		$("#selplotData"+i).append(val+"<br>");
	});

}

function selmodel(i) {
	$("body").append('\
		<div id="modeldata'+i+'">\
			<table id="model'+i+'" class="table table-striped table-bordered table-condensed">\
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
	
	$.getJSON('http://fire.rccc.ou.edu/mongo/db_find/flora/model/{"fields":{"REF_NO":1,"Sitename":1,"NO_Species":1,"Est_NO_Species":1}}?callback=?', function(modeldata) {
		$.each(modeldata, function(key, val) { 
			if (jQuery.inArray(val.REF_NO, saveselsites[i]) > -1) {
				$( "#model"+i+" tbody" ).append( "<tr>" + 
						"<td>" + val.REF_NO + "</td>" + 
						"<td><a style='color:#08C;' href='#' onclick='showbib("+'"'+parseInt(val.REF_NO)+'"'+");'>" + val.Sitename + "</a></td>" +
						"<td style='text-align:right;'>" + val.NO_Species + "</td>" +
						"<td style='text-align:right;'>" + val.Est_NO_Species.toFixed(2) + "</td>" +
						"</tr>"
				); 
			}
		});
	});
	
	$("#modeldata"+i).dialog({ height:500, width:800, title: "Model Data - selected: "+saveselsites[i].length, close: function() { $("#modeldata"+i).remove(); } });
}

function seldownld(i) {
	$("#selAccordion").append('<div id="downinfo'+i+'"></div>');
	$("#downinfo"+i).dialog({ height:500, width:850, title: "Download "+saveselsites[i].length+" sites", close: function() { $("#downinfo"+i).remove(); } });
	$("#downinfo"+i).append('<br /><br /><h4>Citations</h4>');
	$("#downinfo"+i).append('<a style="color:#08C;" href=http://test.cybercommons.org/tools/getbib/endnote/{"spec":{"label":{"$in":['+saveselsites[i]+']}}}/flora/citation>EndNote</a> &bull; ');
	$("#downinfo"+i).append('<a style="color:#08C;" href=http://test.cybercommons.org/tools/getbib/ris/{"spec":{"label":{"$in":['+saveselsites[i]+']}}}/flora/citation>RIS</a> &bull; ');
	$("#downinfo"+i).append('<a style="color:#08C;" href=http://test.cybercommons.org/tools/getbib/bibtex/{"spec":{"label":{"$in":['+saveselsites[i]+']}}}/flora/citation>Bib Tex</a><br />');
	$("#downinfo"+i).append('<br /><br /><h4>Flora Data</h4>');
	$("#downinfo"+i).append('<a style="color:#08C;" href=http://test.cybercommons.org/mongo/db_find/flora/data/{"spec":{"REF_NO":{"$in":['+saveselsites[i]+']}}}?outtype=csv>CSV</a><br />');
}

function searchState (sstates) {
	unHighlightAll();
	var sstates = sstates.join();
	$.each(floraLayer.features, function(key,val) {
		$.each(val.attributes.State, function(key2,val2) {
			val2='"'+val2+'"';
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
		$.each(floraLayer.features, function(key,val) {
			if (txtsrch == val.attributes.REF_NO) {
				onFeatureSelect(val)
				selectControls.select.highlight(val);
			}
		});
	}else{
		$.each(floraLayer.features, function(key,val) {
			if (val.attributes.Sitename.toLowerCase().indexOf(txtsrch.toLowerCase()) > -1) {
				onFeatureSelect(val)
				selectControls.select.highlight(val);
			}
		});
	}
}

//Advance Search============================================================================================
function addadvSearchLine() {
	if (( advsrch==0) || ($("#askey"+advsrch).val() != ""  && $("#keyval"+advsrch).val() != "" ) ) {
		advsrch +=1;
		getadvSearch(advsrch);
	}
}

function getadvSearch(num) {
	var txt='';
	if (num < 2) {
		txt+='<div id="asdiv'+num+'" class="row-fluid">';
		
		txt+='<div class="span3">';
		txt+='<td><select id="askey'+num+'" onchange="keychg('+num+');">';
		txt+='<option value=""> == Select Field == </option>';
		$.each(dkeys, function(key, val) {
			txt+='<option value='+key+'>'+val+'</option>';
		}); 
		txt+='</select>';
		txt+='</div>';
		
		txt+='<div class="span1"></div>';
		txt+='<div id="ktypeval'+num+'" class="span5"></div>';
		txt+='<div class="span1"></div>';
		txt+='<div class="span1"><a class="close" data-dismiss="alert" onclick="removeAdvSrch('+num+');"> x </a></div>';
		
		txt+='</div>';
	}else{
		txt+='<div id="asdiv'+num+'" class="row-fluid">';
		
		txt+='<div id="andorDiv'+num+'" class="row-fluid">';
		txt+='<div class="span3"></div>';
		txt+='<div class="span3">';
		txt+='<select id="andor'+advsrch+'" class="span5" style="color:blue">';
		txt+='<option value="and">And</option>';
		txt+='<option value="or">Or</option>';
		//txt+='<option value="nor">Not</option>';
		txt+='</select>';
		txt+='</div>';
		txt+='</div>';	
		
		txt+='<div class="row-fluid">';
		txt+='<div class="span3">';
		txt+='<td><select id="askey'+num+'" onchange="keychg('+num+');">';
		txt+='<option value=""> == Select Field == </option>';
		$.each(dkeys, function(key, val) {
			txt+='<option value='+key+'>'+val+'</option>';
		}); 
		txt+='</select>';
		txt+='</div>';
		
		txt+='<div class="span1"></div>';
		txt+='<div id="ktypeval'+num+'" class="span5"></div>';
		txt+='<div class="span1"></div>';
		txt+='<div class="span1"><a class="close" data-dismiss="alert" onclick="removeAdvSrch('+num+');"> x </a></div>';
		txt+='</div>';		
		
		txt+='</div>';		
	}
	$("#advanceAll").append(txt);
}

function removeAdvSrch(num) {
	advsrch -=1;
	$("#asdiv"+num).remove();
}
	
function keychg(num) {
	var skey = $("#askey"+num).val();
	var mmval=[];
	if (dkeytyp[skey] == 'n'){
		var url = "http://test.cybercommons.org/mongo/distinct/flora/data/" + dkeys[skey] + "/{}/?callback=?";
		$.getJSON(url,function(data){
			$.each(data, function(key,val) { 
				if (val) {
					mmval.push(parseInt(val));
				}
			});
			var dmin = Math.min.apply( Math, mmval );
			var dmax = Math.max.apply( Math, mmval );
			$("#ktypeval"+num).html('<td>Min:<input class="input-small" id="asmin'+num+'" type="text" value="'+dmin+'" style="text-align:right;">Max:<input class="input-small" id="asmax'+num+'" type="text" value="'+dmax+'" style="text-align:right;"></td>');
		});
	}else{
		$("#ktypeval"+num).html('<select id="keyval'+num+'"><option value=""> == Select String == </option></select>'); 
		var url = "http://test.cybercommons.org/mongo/distinct/flora/data/" + dkeys[skey] + "/{}/?callback=?";
		$.getJSON(url,function(data){
			data.sort();
			$.each(data, function(key,val) { 
				 $("#keyval"+num).append($("<option></option>").attr("value",val).text(val)); 			
			});
		});
	}
}

function advanceSearch() {
	sitesSel=[];
	var aqry='';
	var qry='';
	
	for (i=1;i<=advsrch;i++) {
		var skey = $("#askey"+i).val();
		var sfld = dkeys[ skey ];
		var sdval = $("#keyval"+i).val();
		var asmin = $("#asmin"+i).val();
		var asmax = $("#asmax"+i).val();
		var andor = ($("#andor"+i).val()) ? $("#andor"+i).val() : 'and';
		var qstr='';
		
		if ( skey == "" ) {	
			continue;
		}
		
		if (dkeytyp[skey] == 'n') {
			asmin = asmin.replace(/^\s+|\s+$|\"+|\'+/g, '');
			asmax = asmax.replace(/^\s+|\s+$|\"+|\'+/g, '');
			if ( asmin == "" && asmax == "" ) {
				continue;
			}
			qstr='[ '+sfld+':'+asmin+'-'+asmax+' ] ';
			
			qry+="{'"+sfld+"':{'$gte':"+asmin+",'$lte':"+asmax+"}},";
		}else{
			if ( sdval == "" ) {
				continue;
			}
			qstr='[ '+sfld+':'+sdval+' ] ';
			
			qry+="{'"+sfld+"':'"+sdval+"'},";
		}
		
		if (i>1){
			aqry+=' '+andor+' '+qstr
		}else{
			aqry+=qstr;
		}
		
	}
	
	$("#srchmsg").html("&nbsp;&nbsp;&nbsp;&nbsp;<font color='red'>Searching . . .</font>");
	$("#sites tbody").empty();
	var url ="http://test.cybercommons.org/mongo/db_find/flora/data/{'spec': {'$"+andor+"': [ "+qry+" ]} ,'fields':['REF_NO','Sitename','State','Year','midlat','midlon','NO_Species','Area_hectares','NO_Tot_Taxa']}/?callback=?";
	$.getJSON(url,function(data){
		data.sort();
		$.each(data, function(key,val) { 
			sitesSel.push(val.REF_NO);
			$( "#sites tbody" ).append( "<tr>" + 
					"<td>" + val.REF_NO + "</td>" + 
					"<td><a style='color:#08C;' href='#' onclick='showbib("+'"'+parseInt(val.REF_NO)+'"'+");'>" + val.Sitename + "</a></td>" +
					"<td style='text-align:center;'>" + val.Year + "</td>" + 
					"<td style='text-align:right;'>" + val.Area_hectares + "</td>" + 
					"<td style='text-align:right;'>" + val.NO_Tot_Taxa + "</td>" + 
					"</tr>"
			); 			
		});
		$("#srchmsg").html("&nbsp;&nbsp;&nbsp;&nbsp;"+sitesSel.length);
		$("#selname").val("Advance Search");
	});


	$("#selinfo").dialog({ title: aqry }).dialog('open');

}

//EndNote Search============================================================================================
function addendnoteSearchLine() {
	if (( endnsrch==0) || ($("#enkey"+endnsrch).val() != ""  && $("#enkeyval"+endnsrch).val() != "" ) ) {
		endnsrch +=1;
		getendnoteSearch(endnsrch);
	}
}

function getendnoteSearch(num) {
	var txt='';
	if (num < 2) {
		txt+='<div id="endiv'+num+'" class="row-fluid">';
		
		txt+='<div class="span3">';
		txt+='<td><select id="enkey'+num+'" onchange="enkeychg('+num+');">';
		txt+='<option value=""> == Select Field == </option>';
		$.each(enkeys, function(key, val) {
			txt+='<option value='+key+'>'+val+'</option>';
		}); 
		txt+='</select>';
		txt+='</div>';
		
		txt+='<div class="span1"></div>';
		txt+='<div id="enktypeval'+num+'" class="span5"></div>';
		txt+='<div class="span1"></div>';
		txt+='<div class="span1"><a class="close" data-dismiss="alert" onclick="removeEndNSrch('+num+');"> x </a></div>';
		
		txt+='</div>';
	}else{
		txt+='<div id="endiv'+num+'" class="row-fluid">';
		
		txt+='<div id="enandorDiv'+num+'" class="row-fluid">';
		txt+='<div class="span3"></div>';
		txt+='<div class="span3">';
		txt+='<select id="enandor'+endnsrch+'" class="span5" style="color:blue">';
		txt+='<option value="and">And</option>';
		txt+='<option value="or">Or</option>';
		//txt+='<option value="nor">Not</option>';
		txt+='</select>';
		txt+='</div>';
		txt+='</div>';	
		
		txt+='<div class="row-fluid">';
		txt+='<div class="span3">';
		txt+='<td><select id="enkey'+num+'" onchange="enkeychg('+num+');">';
		txt+='<option value=""> == Select Field == </option>';
		$.each(enkeys, function(key, val) {
			txt+='<option value='+key+'>'+val+'</option>';
		}); 
		txt+='</select>';
		txt+='</div>';
		
		txt+='<div class="span1"></div>';
		txt+='<div id="enktypeval'+num+'" class="span5"></div>';
		txt+='<div class="span1"></div>';
		txt+='<div class="span1"><a class="close" data-dismiss="alert" onclick="removeEndNSrch('+num+');"> x </a></div>';
		txt+='</div>';		
		
		txt+='</div>';		
	}
	$("#endnoteAll").append(txt);
}

function removeEndNSrch(num) {
	endnsrch -=1;
	$("#endiv"+num).remove();
}

function enkeychg(num) {
	var skey = $("#enkey"+num).val();
	var mmval=[];
	if (enkeytyp[skey] == 'n'){
		var url = "http://test.cybercommons.org/mongo/distinct/flora/endnote/" + enkeys[skey] + "/{}/?callback=?";
		$.getJSON(url,function(data){
			$.each(data, function(key,val) { 
				if (val) {
					mmval.push(parseInt(val));
				}
			});
			var dmin = Math.min.apply( Math, mmval );
			var dmax = Math.max.apply( Math, mmval );
			$("#enktypeval"+num).html('<td>Min:<input class="input-small" id="enasmin'+num+'" type="text" value="'+dmin+'" style="text-align:right;">Max:<input class="input-small" id="enasmax'+num+'" type="text" value="'+dmax+'" style="text-align:right;"></td>');
		});
	}else{
		$("#enktypeval"+num).html('<select id="enkeyval'+num+'"><option value=""> == Select String == </option></select>'); 
		var url = "http://test.cybercommons.org/mongo/distinct/flora/endnote/" + enkeys[skey] + "/{}/?callback=?";
		$.getJSON(url,function(data){
			data.sort();
			$.each(data, function(key,val) { 
				$("#enkeyval"+num).append($("<option></option>").attr("value",val).text(val)); 			
			});
		});
	}
}

function endnoteSearch() {
	sitesSel=[];
	var aqry='';
	var qry='';
	
	for (i=1;i<=endnsrch;i++) {
		var skey = $("#enkey"+i).val();
		var sfld = enkeys[ skey ];
		var sdval = $("#enkeyval"+i).val();
		var enasmin = $("#enasmin"+i).val();
		var enasmax = $("#enasmax"+i).val();
		var enandor = ($("#enandor"+i).val()) ? $("#enandor"+i).val() : 'and';
		var qstr='';
		
		if ( skey == "" ) {	
			continue;
		}
		
		if (enkeytyp[skey] == 'n') {
			enasmin = enasmin.replace(/^\s+|\s+$|\"+|\'+/g, '');
			enasmax = enasmax.replace(/^\s+|\s+$|\"+|\'+/g, '');
			if ( enasmin == "" && enasmax == "" ) {
				continue;
			}
			qstr='[ '+sfld+':'+enasmin+'-'+enasmax+' ] ';
			
			qry+="{'"+sfld+"':{'$gte':"+enasmin+",'$lte':"+enasmax+"}},";
		}else{
			if ( sdval == "" ) {
				continue;
			}
			qstr='[ '+sfld+':'+sdval+' ] ';
			
			qry+="{'"+sfld+"':'"+sdval+"'},";
		}
		
		if (i>1){
			aqry+=' '+enandor+' '+qstr
		}else{
			aqry+=qstr;
		}
		
	}

	$("#srchmsg").html("&nbsp;&nbsp;&nbsp;&nbsp;<font color='red'>Searching . . .</font>");
	$("#sites tbody").empty();
	var url ="http://test.cybercommons.org/mongo/db_find/flora/endnote/{'spec': {'$"+enandor+"': [ "+qry+" ]} ,'fields':['Label']}/?callback=?";
	$.getJSON(url,function(data){
		data.sort();
		$.each(data, function(key,val) { 
			$.each(sitesTotal, function(key2,val2) { 
				if (val.Label==val2.REF_NO){
					sitesSel.push(val2.REF_NO);
					$( "#sites tbody" ).append( "<tr>" + 
							"<td>" + val2.REF_NO + "</td>" + 
							"<td><a style='color:#08C;' href='#' onclick='showbib("+'"'+parseInt(val2.REF_NO)+'"'+");'>" + val2.Sitename + "</a></td>" +
							"<td style='text-align:center;'>" + val2.Year + "</td>" + 
							"<td style='text-align:right;'>" + val2.Area_hectares + "</td>" + 
							"<td style='text-align:right;'>" + val2.NO_Tot_Taxa + "</td>" + 
							"</tr>"
					); 			
				}
			});
		});
		$("#srchmsg").html("&nbsp;&nbsp;&nbsp;&nbsp;"+sitesSel.length);
		$("#selname").val("EndNote Search");
	});

	$("#selinfo").dialog({ title: aqry }).dialog('open');
	
}




function unHighlightAll() {
	$.each(floraLayer.features, function(key,val) {
		selectControls.select.unhighlight(val);
	});
}

function IsNumeric(input) {
	return (input - 0) == input && input.length > 0;
}

/* End of flora.js =========================== */
