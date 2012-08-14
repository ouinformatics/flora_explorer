/* ===================================================
 * flora.js
 *  31 May 2012
 * ===================================================
 * Copyright (c) 2012 University of Oklahoma
 *
 * console.log();
 * =================================================== */

var map, options, floraLayer, selectControls;
var sitesTotal=[],sitesActive=[], sitesSel=[];

var selnum=0, saveselsites=[];
var selplot_data=[],plot_data=[],plotDesc=[], plotselDesc=[];
var savflg=0;

var states = {"AL":"Alabama","AK":"Alaska","AZ":"Arizona","AR":"Arkansas","CA":"California","CO":"Colorado","CT":"Connecticut","DE":"Delaware","DC":"District/Columbia","FL":"Florida","GA":"Georgia","HI":"Hawaii","ID":"Idaho","IL":"Illinois","IN":"Indiana","IA":"Iowa","KS":"Kansas","KY":"Kentucky","LA":"Louisiana","ME":"Maine","MD":"Maryland","MA":"Massachusetts","MI":"Michigan","MN":"Minnesota","MS":"Mississippi","MO":"Missouri","MT":"Montana","NE":"Nebraska","NV":"Nevada","NH":"New Hampshire","NJ":"New Jersey","NM":"New Mexico","NY":"New York","NC":"North Carolina","ND":"North Dakota","OH":"Ohio","OK":"Oklahoma","OR":"Oregon","PA":"Pennsylvania","RI":"Rhode Island","SC":"South Carolina","SD":"South Dakota","TN":"Tennessee","TX":"Texas","UT":"Utah","VT":"Vermont","VA":"Virginia","WA":"Washington","WV":"West Virginia","WI":"Wisconsin","WY":"Wyoming","ALB":"Alberta","BCL":"British Columbia","CAN":"Canada","MAN":"Manitoba","NB":"New Brunswick","NFL":"Newfoundland","NS":"Nova Scotia","NWT":"Northwest Territories","ONT":"Ontario","PEI":"Prince Edward Island","QUE":"Quebec","SAS":"Saskatchewan","SPM":"Saint Pierre et Miquelon","YUK":"Yukon"};
var myStyles, stylesColor={"0":"#BD2126","1":"#C79428","2":"#F2D65C","3":"#F5914D","4":"#69C4AD","5":"#264A6E","6":"#A1C7FF","7":"#B575B5","8":"#007A63","9":"#705421","10":"#4D1275","11":"#8CC4D6"};

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

	myStyles = new OpenLayers.StyleMap({
        "default": new OpenLayers.Style({ fillOpacity: 1, pointRadius: 3.5, strokeWidth: 1, fillColor: "#8CBA52", graphicZIndex: 1 }),
        "select": new OpenLayers.Style({ fillOpacity: 1, fillColor: "#F6358A", graphicZIndex: 2 })
    });
    floraLayer = new OpenLayers.Layer.Vector("Flora Sites", {styleMap: myStyles});

	$("#totmsg").show() .html("Loading . . .");
	var st=[];
	$.getJSON('http://test.cybercommons.org/mongo/db_find/flora/data/{"fields":{"REF_NO":1,"Sitename":1,"State":1,"Year":1,"midlat":1,"midlon":1,"NO_Species":1,"Area_hectares":1,"NO_Tot_Taxa":1}}?callback=?', function(fdata) {
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
		
		$("#totmsg").html("<table width='100%'><tr><td>Total Sites: <b>"+sitesTotal.length+"</b></td><td style='text-align:right;'><a href='#' class='btn btn-info btn-mini' onclick='reload();'>Re-Load</a></td></tr></table>");

	}); //end getJSON

	map.addLayer( floraLayer );

	map.addControl( new OpenLayers.Control.MousePosition({emptyString:"Floras Explorer"} ) );
	map.addControl( new OpenLayers.Control.LayerSwitcher() );
	map.addControl( new OpenLayers.Control.ScaleLine() );
    
	selectControls = {select: new OpenLayers.Control.SelectFeature( floraLayer, { box:true, multipleKey:"shiftKey", toggleKey:"ctrlKey", onSelect:onFeatureSelect, onUnselect:onFeatureUnselect } ) };
	map.addControl(selectControls.select);
	document.getElementById("box").checked=true;
	selectControls.select.activate();
   
}); //end window Load

function onFeatureSelect(feature) {
	sitesSel.push(feature.attributes.REF_NO);
	$( "#sites tbody" ).append( "<tr>" + 
			"<td>" + feature.attributes.REF_NO + "</td>" + 
			"<td><a style='color:#08C;' href='http://fire.rccc.ou.edu/flora/"+parseInt(feature.attributes.REF_NO)+"' target='_blank'>" + feature.attributes.Sitename + "</a></td>" +
			"<td style='text-align:center;'>" + feature.attributes.Year + "</td>" + 
			"<td style='text-align:right;'>" + feature.attributes.Area + "</td>" + 
			"<td style='text-align:right;'>" + feature.attributes.Taxon + "</td>" + 
			"</tr>"
	); 
	$("#selinfo").dialog({ title: "Selected Sites : "+sitesSel.length}).dialog('open');
//	$("#msg").html("Selected: <b>"+sitesSel.length+"</b>");
}

function onFeatureUnselect(feature) {
	sitesSel=[];
	$("#sites tbody").empty();
}

$(document).ready( function() {

	//modal windows
	$('#about').modal({ show : false }) .draggable({ containment: "parent" });
	$('#contact').modal({ show : false }) .draggable({ containment: "parent" });
	$('#help').modal({ show : false, backdrop:false }) .draggable({ containment: "parent" });

	$("#map").resizable();

	$("#selinfo").dialog({ autoOpen:false, height:500, width:800, position: [40,50],
		 close: function() { closesites(); },
		 buttons: [{ text: "Save",  class: "btn btn-success", click: function() { savesites(); $(this).dialog("close"); } },
                   { text: "Close", class: "btn", click: function() { $(this).dialog("close"); } } ] });

	$("#plotinfo").dialog({ autoOpen:false, height:500, width:850, close: function() { $(this).dialog("close"); } });
	
	$("#downinfo").dialog({ autoOpen:false, height:500, width:850, close: function() { $(this).dialog("close"); } });
	
	$("#advance").dialog({ autoOpen: false, width: 800 });
	$("#advWin").click(function() {
		$(advance).dialog('open');
	});
	
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
		
}); //end document ready

//activate/deactivate draw box
function selbox() {
    if (document.getElementById("box").checked) {
    	selectControls.select.activate();
    }else{
    	selectControls.select.deactivate();
    }
}	

function reload() {
	//reload total sites
	sitesActive=[];
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
	
	$("#totmsg").html("<table width='100%'><tr><td>Total Sites: <b>"+sitesTotal.length+"</b></td><td style='text-align:right;'><a href='#' class='btn btn-info btn-mini' onclick='reload();'>Re-Load</a></td></tr></table>");
	$("#msg").empty();
}

function savesites() {
	saveselsites[selnum]=sitesSel;
	
	if (selnum==1) {
		$("#selAccordion").prepend("<div id='all' class='alert alert-info' style='text-align:center;'><b>ALL:</b> <a href='#' onclick='viewall();'>View</a> &bull;  <a href='#' onclick='showall();'>Show</a> &bull; <a href='#' onclick='plotall();'>Plot</a><div id='showPlotAll'></div></div>");
	}
	$("#selAccordion").append(function() {
		return appendSel();
	});
	selnum=selnum+1
	savflg=1;
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

function closeSel() {
	selnum=selnum-1
	if (selnum==0) {
		saveselsites=[];
		$("#all").hide();
	}
}

function appendSel() {
	var txt = "<div class='accordion-group'> \
	    			<a class='close' data-dismiss='alert' onclick='closeSel();'>x</a> \
					<div class='accordion-heading'> \
						<a class='accordion-toggle' data-toggle='collapse' data-parent='#selAccordion' href='#selnum"+selnum+"'>Sites selected "+sitesSel.length+"</a> \
					</div> \
					<div id='selnum"+selnum+"' class='accordion-body collapse'> \
						<div class='accordion-inner' style='text-align:center;'> \
							<a href='#' onclick='selview("+selnum+");'>View</a> &bull;  \
							<a href='#' onclick='selshow("+selnum+");'>Show</a> &bull;  \
							<a href='#' onclick='selplot("+selnum+");'>Plot</a> &bull;  \
							<a href='#' onclick='selmodel("+selnum+");'>Model</a> &bull; \
							<a href='#' onclick='seldownld("+selnum+");'>Download</a> \
					    </div> \
	        		</div> \
	        	</div>";
	return txt;
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
						"<td><a style='color:#08C;' href='http://fire.rccc.ou.edu/flora/"+parseInt(val.attributes.REF_NO)+"' target='_blank'>" + val.attributes.Sitename + "</a></td>" +
						"<td style='text-align:center;'>" + val.attributes.Year + "</td>" + 
						"<td style='text-align:right;'>" + val.attributes.Area + "</td>" + 
						"<td style='text-align:right;'>" + val.attributes.Taxon + "</td>" + 
						"</tr>"
				); 
			}
		});
	}
	$("#selinfo").dialog({ title: "Selected Sites : "+allsites}).dialog('open');
}

function showall() {
	for (i=0;i<=saveselsites.length;i++) {
		myStyles.styles.select.defaultStyle.fillColor=stylesColor[i];
		$.each(floraLayer.features, function(key,val) {
			if (jQuery.inArray(val.attributes.REF_NO, saveselsites[i-1]) > -1) {
				selectControls.select.highlight(val);
			}
		});
	}
	myStyles.styles.select.defaultStyle.fillColor="#8CBA52"; //default
}

function selview(selnum) {
	$("#sites tbody").empty();
	$.each(floraLayer.features, function(key,val) {
		if (jQuery.inArray(val.attributes.REF_NO, saveselsites[selnum]) > -1) {
			$( "#sites tbody" ).append( "<tr>" + 
					"<td>" + val.attributes.REF_NO + "</td>" + 
					"<td><a style='color:#08C;' href='http://fire.rccc.ou.edu/flora/"+parseInt(val.attributes.REF_NO)+"' target='_blank'>" + val.attributes.Sitename + "</a></td>" +
					"<td style='text-align:center;'>" + val.attributes.Year + "</td>" + 
					"<td style='text-align:right;'>" + val.attributes.Area + "</td>" + 
					"<td style='text-align:right;'>" + val.attributes.Taxon + "</td>" + 
					"</tr>"
			); 
		}
	});
	$("#selinfo").dialog({ title: "Selected Sites : "+saveselsites[selnum].length}).dialog('open');
}

function selshow(selnum) {
	myStyles.styles.select.defaultStyle.fillColor=stylesColor[selnum];
	$.each(floraLayer.features, function(key,val) {
		if (jQuery.inArray(val.attributes.REF_NO, saveselsites[selnum]) > -1) {
			selectControls.select.highlight(val);
		}
	});
	myStyles.styles.select.defaultStyle.fillColor="#8CBA52"; //default
}

function plotall() {
	selplot_data=[],plot_data=[];
	
	$.each(sitesTotal, function(i, val) {
		var lh=Math.log(parseFloat(val.Area_hectares)) / Math.log(10);
		var ls=Math.log(parseFloat(val.NO_Species)) / Math.log(10);
		if (jQuery.inArray(val.REF_NO, sitesActive) > -1) {
			plot_data.push([ lh, ls ]);
		}
		
		for (i=0;i<=saveselsites.length;i++) {
			if (jQuery.inArray(val.REF_NO, saveselsites[i-1]) > -1) {
				selplot_data.push([ lh, ls ]);
			}
		}
	});

	var plot_options={lines: { show: false }, points: { show: true }, grid:{hoverable: true}, selection: { mode: "xy" }, 
			yaxis : { show : true, axisLabel : 'log(NO_Species) / log10', position: 'left' },
			xaxis : { show : true, axisLabel : 'log(Area) / log10'} };
	
	var d1 = {color: "#8CBA52", data: plot_data };			
	var d2 = {color: stylesColor[1], data: selplot_data };	

	$("#plotinfo").dialog({ title: "Plot All Data - total: "+plot_data.length+"  selected: "+selplot_data.length}).dialog('open');
	$.plot($("#plot"), [d1,d2], plot_options);

}

function selplot(selnum) {
	selplot_data=[],plot_data=[];
	$.each(sitesTotal, function(i, val) {
		var lh=Math.log(parseFloat(val.Area_hectares)) / Math.log(10);
		var ls=Math.log(parseFloat(val.NO_Species)) / Math.log(10);
		if (jQuery.inArray(val.REF_NO, sitesActive) > -1) {
			plotDesc.push(val);
			plot_data.push([ lh, ls ]);
		}
		if (jQuery.inArray(val.REF_NO, saveselsites[selnum]) > -1) {
			plotselDesc.push(val);
			selplot_data.push([ lh, ls ]);
		}
	});

	var plot_options={lines: { show: false }, points: { show: true }, grid:{hoverable: true}, selection: { mode: "xy" }, 
			yaxis : { show : true, axisLabel : 'log(NO_Species) / log10', position: 'left' },
			xaxis : { show : true, axisLabel : 'log(Area) / log10'} };
	
	var d1 = {color: "#8CBA52", data: plot_data };			
	var d2 = {color: stylesColor[selnum], data: selplot_data };	

	$("#plotinfo").dialog({ title: "Plot Data - total: "+plot_data.length+"  selected: "+selplot_data.length}).dialog('open');
	$.plot($("#plot"), [d1,d2], plot_options);
	
}

function selmodel(selnum) {
	alert('Model coming soon ...');
}

function seldownld(selnum) {
	$("#downinfo").empty();
	$("#downinfo").append('<br /><br /><h4>Citations</h4>');
	$("#downinfo").append('<a style="color:#08C;" href=http://test.cybercommons.org/tools/getbib/endnote/{"spec":{"label":{"$in":['+saveselsites[selnum]+']}}}/flora/citation>EndNote</a> &bull; ');
	$("#downinfo").append('<a style="color:#08C;" href=http://test.cybercommons.org/tools/getbib/ris/{"spec":{"label":{"$in":['+saveselsites[selnum]+']}}}/flora/citation>RIS</a> &bull; ');
	$("#downinfo").append('<a style="color:#08C;" href=http://test.cybercommons.org/tools/getbib/bibtex/{"spec":{"label":{"$in":['+saveselsites[selnum]+']}}}/flora/citation>Bib Tex</a><br />');
	$("#downinfo").append('<br /><br /><h4>Flora Data</h4>');
	$("#downinfo").append('<a style="color:#08C;" href=http://test.cybercommons.org/mongo/db_find/flora/data/{"spec":{"REF_NO":{"$in":['+saveselsites[selnum]+']}}}?outtype=csv>CSV</a><br />');
	
	$("#downinfo").dialog({ title: "Downloads"}).dialog('open');
}




//draw selected states
function searchState (sstates) {
	unHighlightAll();
	myStyles.styles.select.defaultStyle.fillColor="#F6358A";
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
	myStyles.styles.select.defaultStyle.fillColor="#8CBA52"; //default
}

//draw selected text search
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

function unHighlightAll() {
	$.each(floraLayer.features, function(key,val) {
		selectControls.select.unhighlight(val);
	});
}

function IsNumeric(input) {
	return (input - 0) == input && input.length > 0;
}

/* End of flora.js =========================== */
