        //var map, drawControls, selectControl, selectedFeature;    
        //var extent = new OpenLayers.Bounds(-178.3125, 6.44921875, -36.6875, 95.55078125);    
        //var extent = new OpenLayers.Bounds(-178.3125, 6.44921875, -37.6875, 85.55078125);

    function initialize_map(){

    //var map, drawControls, selectControl, selectedFeature;
    //var extent = new OpenLayers.Bounds(-178.3125, 6.44921875, -36.6875, 95.55078125);
    //var extent = new OpenLayers.Bounds(-178.3125, 6.44921875, -37.6875, 85.55078125);
    map = new OpenLayers.Map('map', { restrictedExtent: extent } );
    var wms = new OpenLayers.Layer.WMS( "OpenLayers WMS","http://vmap0.tiles.osgeo.org/wms/vmap0", {layers: 'basic'},{singleTile:true} );

    var myStyles = new OpenLayers.StyleMap({
        "default": new OpenLayers.Style({ fillOpacity: .7, pointRadius: 6, strokeWidth: 1, fillColor: "#8BB94D", graphicZIndex: 1 }),
        "select": new OpenLayers.Style({ fillOpacity: .7, fillColor: "#CF9215", graphicZIndex: 1 })
    });
    var tecoLayer = new OpenLayers.Layer.Vector("Teco Sites", {styleMap: myStyles} );
    $("#mapinfo").html("Loading . . .");
    var points=[];
        $.getJSON("http://test.cybercommons.org/mongo/db_find/catalog/location/%7B%22spec%22:%7B%22commons_id%22:300,%22loc_id%22:%7B'$in':['US-HA1','US-ARM','US-ATQ','US-BRW','US-DK2','US-DK3','US-UMB','US-VAR','US-NE3','US-NE1','US-SYV','US-LOS','US-ME2','US-TON','US-SO2','US-WCR','US-IB1','US-MOZ','US-MMS','US-IB2','US-HO1','US-NR1','US-PFA','US-SHD','US-NE2']%7D%7D%7D/?callback=?", function(fdata) {
                $.each(fdata, function(key,val) {
                        var pointFeature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(val.lon, val.lat));
                pointFeature.attributes = {
                                "lat": val.lat,
                                "loc_county": val.loc_county,
                                "loc_id": val.loc_id,
                                "loc_name": val.loc_name,
                                "loc_purpose": val.loc_purpose,
                                "loc_state": val.loc_state,
                                "lon": val.lon,
                                "site_url": val.site_url
                                };
                points.push(pointFeature);
                });

                tecoLayer.destroyFeatures();
                tecoLayer.addFeatures(points);

            $("#mapinfo").html("<input type='hidden' id='sitesel' value=''>Sites: <b>"+points.length+"</b>");

        }); //end getJSON               

        map.addLayers([wms, tecoLayer]);
        map.zoomToMaxExtent();

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
   
        popup = new OpenLayers.Popup.FramedCloud("featurePopup", feature.geometry.getBounds().getCenterLonLat(), new OpenLayers.Size(100,100),
                "<b>"+feature.attributes.loc_name + "</b><table class='table-condensed' style='margin-bottom:5px;'>" +
                "<tr><th>ID</th><td>"+feature.attributes.loc_id + "</td></tr>" +
                "<tr><th>Type</th><td>"+feature.attributes.loc_purpose + "</td></tr>" +
                "<tr><th>State</th><td>"+feature.attributes.loc_state + "</td></tr>" +
                "<tr><th>Country</th><td>"+feature.attributes.loc_county + "</td></tr>" +
                "<tr><td colspan='2'><a style='color:blue;' href='"+feature.attributes.site_url + "' target='_blank'>AmeriFlux Site Description</a></td></tr>" +
                "<tr><td colspan='2'><a style='color:blue;' href='http://maps.google.com/maps?z=15&t=k&q=loc:"+feature.attributes.lat+","+feature.attributes.lon+"' target='_blank'>Google Maps</a></td></tr></table>" ,
                null, true, onPopupClose);
        popup.panMapIfOutOfView = true;
        popup.autoSize = true; 
        feature.popup = popup;
        popup.feature = feature;
        map.addPopup(popup, true);
  
        var id = (feature.attributes.loc_id) ? feature.attributes.loc_id : '';
        $("#mapinfo").html("<input type='hidden' id='sitesel' value='" + id + "'>" + id + " - " + feature.attributes.loc_name );
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
