        //var map, drawControls, selectControl, selectedFeature;    
        //var extent = new OpenLayers.Bounds(-178.3125, 6.44921875, -36.6875, 95.55078125);    
        //var extent = new OpenLayers.Bounds(-178.3125, 6.44921875, -37.6875, 85.55078125);
    var floraLayer
    var features=[]
    function initialize_map(REF_NO){

    //var map, drawControls, selectControl, selectedFeature;
    //var extent = new OpenLayers.Bounds(-178.3125, 6.44921875, -36.6875, 95.55078125);
    //var extent = new OpenLayers.Bounds(-178.3125, 6.44921875, -37.6875, 85.55078125);
    //Initialize map
    options = {
        spericalMercator: true,
        projection: new OpenLayers.Projection("EPSG:900913"),
        maxResolution: 156543.0339,
        maxZoomLevels: 18,
        displayProjection: new OpenLayers.Projection("EPSG:4326"),
        units: "m" //,
        //restrictedExtent: extent
        //maxExtent: new OpenLayers.Bounds([ -19803292.13, -5205054.49, 547896.95, 15497748.74 ])
    }
    map = new OpenLayers.Map('map', options);
    //Layers
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
        lay_osm
    ];
    //var wms = new OpenLayers.Layer.WMS( "OpenLayers WMS","http://vmap0.tiles.osgeo.org/wms/vmap0", {layers: 'basic'},{singleTile:true} );
    
    var myStyles = new OpenLayers.StyleMap({
        "default": new OpenLayers.Style({ fillOpacity: .7, pointRadius: 6, strokeWidth: 1, fillColor: "#8BB94D", graphicZIndex: 1 }),
        "select": new OpenLayers.Style({ fillOpacity: .7, fillColor: "#CF9215", graphicZIndex: 1 })
    });
    floraLayer = new OpenLayers.Layer.Vector("Flora", {styleMap: myStyles} );
    var points=[];
    var lonmax=0;
    var latmax=0;
    var lonmin=0;
    var latmin=0;
    var ref_1 = REF_NO + 1
    var ct = 0
    var query = "{'spec':{'REF_NO':{'$gte':" + REF_NO + ",'$lt':" + ref_1 + "}},'sort':[('REF_NO',1)],'fields':['REF_NO','Sitename','Latitude_N_edge','Latitude_S_edge','Longitude_E_edge','Longitude_W_edge','midlat','midlon']}"
    $.getJSON("/mongo/db_find/flora/data/" + query + "?callback=?", function(fdata) {
                $.each(fdata, function(key,val) {
                        var ppoints = [
                                new OpenLayers.Geometry.Point(val.Longitude_W_edge,val.Latitude_S_edge).transform(options.displayProjection, options.projection),
                                new OpenLayers.Geometry.Point(val.Longitude_W_edge,val.Latitude_N_edge).transform(options.displayProjection, options.projection),
                                new OpenLayers.Geometry.Point(val.Longitude_E_edge,val.Latitude_N_edge).transform(options.displayProjection, options.projection),
                                new OpenLayers.Geometry.Point(val.Longitude_E_edge,val.Latitude_S_edge).transform(options.displayProjection, options.projection)];
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
                if(ct<1){
                    map.zoomToExtent(feature.geometry.getBounds());
                    ct = ct + 1;
                }
                });

                floraLayer.destroyFeatures();
                var feat= features[0]
                floraLayer.addFeatures(feat);

        }); //end getJSON               
        map.addLayers(glayers);
        map.addLayers([floraLayer]);
        map.zoomToMaxExtent();
        map.addControl(new OpenLayers.Control.MousePosition({emptyString: ""}));
        map.addControl(new OpenLayers.Control.LayerSwitcher());
        selectControl = new OpenLayers.Control.SelectFeature(floraLayer);
        map.addControl(selectControl);
        selectControl.activate();
        floraLayer.events.on({
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
