        //var map, drawControls, selectControl, selectedFeature;    
        //var extent = new OpenLayers.Bounds(-178.3125, 6.44921875, -36.6875, 95.55078125);    
        //var extent = new OpenLayers.Bounds(-178.3125, 6.44921875, -37.6875, 85.55078125);
    var tecoLayer
    var features=[]
    function initialize_map(REF_NO){

    //var map, drawControls, selectControl, selectedFeature;
    //var extent = new OpenLayers.Bounds(-178.3125, 6.44921875, -36.6875, 95.55078125);
    //var extent = new OpenLayers.Bounds(-178.3125, 6.44921875, -37.6875, 85.55078125);
    map = new OpenLayers.Map('map', { restrictedExtent: extent } );
    var wms = new OpenLayers.Layer.WMS( "OpenLayers WMS","http://vmap0.tiles.osgeo.org/wms/vmap0", {layers: 'basic'},{singleTile:true} );

    var myStyles = new OpenLayers.StyleMap({
        "default": new OpenLayers.Style({ fillOpacity: .7, pointRadius: 6, strokeWidth: 1, fillColor: "#8BB94D", graphicZIndex: 1 }),
        "select": new OpenLayers.Style({ fillOpacity: .7, fillColor: "#CF9215", graphicZIndex: 1 })
    });
    tecoLayer = new OpenLayers.Layer.Vector("Teco Sites", {styleMap: myStyles} );
    //$("#mapinfo").html("Loading . . .");
    var points=[];
    var lonmax=0;
    var latmax=0;
    var lonmin=0;
    var latmin=0;
    var ref_1 = REF_NO + 1
    var ct = 0
        var query = "{'spec':{'REF_NO':{'$gte':" + REF_NO + ",'$lt':" + ref_1 + "}},'sort':[('REF_NO',1)],'fields':['REF_NO','Sitename','Latitude_N_edge','Latitude_S_edge','Longitude_E_edge','Longitude_W_edge','midlat','midlon']}"
        //alert("http://test.cybercommons.org/mongo/db_find/flora/data/" + query + "?callback=?");
        //$.getJSON("http://test.cybercommons.org/mongo/db_find/flora/data/" + query + "?callback=?", function(fdata) {
        $.getJSON("/mongo/db_find/flora/data/" + query + "?callback=?", function(fdata) {
                $.each(fdata, function(key,val) {
                        var ppoints = [
                                new OpenLayers.Geometry.Point(val.Longitude_W_edge,val.Latitude_S_edge),
                                new OpenLayers.Geometry.Point(val.Longitude_W_edge,val.Latitude_N_edge),
                                new OpenLayers.Geometry.Point(val.Longitude_E_edge,val.Latitude_N_edge),
                                new OpenLayers.Geometry.Point(val.Longitude_E_edge,val.Latitude_S_edge)];
                        var ring = new OpenLayers.Geometry.LinearRing(ppoints);
                        var polygon = new OpenLayers.Geometry.Polygon([ring]);
                        //var pointFeature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(val.midlon, val.midlat));
                var feature = new OpenLayers.Feature.Vector(polygon)//, attributes);
                feature.geometry.groupName = 'green';
                feature.attributes = {
                                "lat": val.midlat,
                                "lon": val.midlon,
                                "sitename": val.Sitename
                                };
                features.push([feature]);
                points.push(feature);
                lonmax=val.Longitude_E_edge;
                lonmin=val.Longitude_W_edge;
                latmax=val.Latitude_N_edge;
                latmin=val.Latitude_S_edge;
                if(ct<1){
                bounds = new OpenLayers.Bounds();
                bounds.extend(new OpenLayers.LonLat(lonmin+0.5,latmin-0.5));
                bounds.extend(new OpenLayers.LonLat(lonmax-0.5,latmax+0.5));
                map.zoomToExtent(bounds);
                ct = ct + 1;
                }
                });

                tecoLayer.destroyFeatures();
                var feat= features[0]
                tecoLayer.addFeatures(feat);//points);

           // $("#mapinfo").html("<input type='hidden' id='sitesel' value=''>Sites: <b>"+points.length+"</b>");

        }); //end getJSON               

        map.addLayers([wms, tecoLayer]);
        map.zoomToMaxExtent();
        //bounds = new OpenLayers.Bounds();
        //bounds.extend(new OpenLayers.LonLat(lonmax,latmax));
        //bounds.extend(new OpenLayers.LonLat(lonmin,latmin));
        //map.zoomToExtent(bounds);
        var mpos = new OpenLayers.Control.MousePosition();
        map.addControl(mpos);

        selectControl = new OpenLayers.Control.SelectFeature(tecoLayer);
        map.addControl(selectControl);
        selectControl.activate();
        tecoLayer.events.on({
            'featureselected': onFeatureSelect,
            'featureunselected': onFeatureUnselect
        });
    }

    function onPopupClose(evt) {
        // 'this' is the popup.
        var feature = this.feature;
        if (feature.layer) { // The feature is not destroyed
            selectControl.unselect(feature);
        } else { // After "moveend" or "refresh" events on POIs layer all 
             //     features have been destroyed by the Strategy.BBOX
            this.destroy();
        }
    }
    function onFeatureSelect(evt) {
        feature = evt.feature;
   
        popup = new OpenLayers.Popup.FramedCloud("featurePopup", feature.geometry.getBounds().getCenterLonLat(), new OpenLayers.Size(10,10),
                "<b>"+feature.attributes.sitename + "</b><table class='table-condensed' style='margin-bottom:5px;'>" +
                "<tr><td colspan='2'><a style='color:blue;' href='http://maps.google.com/maps?z=15&t=k&q=loc:"+feature.attributes.lat+","+feature.attributes.lon+"' target='_blank'>Google Maps</a></td></tr></table>" ,
                null, true, onPopupClose);
        popup.panMapIfOutOfView = true;
        popup.autoSize = true; 
        feature.popup = popup;
        popup.feature = feature;
        map.addPopup(popup, true);
  
        //var id = (feature.attributes.loc_id) ? feature.attributes.loc_id : '';
        //$("#mapinfo").html("<input type='hidden' id='sitesel' value='" + id + "'>" + id + " - " + feature.attributes.loc_name );
    }
    function onFeatureUnselect(evt) {
        feature = evt.feature;
        if (feature.popup) {
            popup.feature = null;
            map.removePopup(feature.popup);
            feature.popup.destroy();
            feature.popup = null;
        }
    }
