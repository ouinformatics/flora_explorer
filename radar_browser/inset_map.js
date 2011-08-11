
function insetMap(commons_id) {
    featurecollection = {}
    var dialog;

//    $.getJSON('/catalog/search/dt_data_commons/commons_id,commons_code/*', function(json) { $.each(json


$.getJSON('/catalog/location/None,'+commons_id, function(json) {         
        featurecollection = json;
        var lon = -95;
        var lat = 35;
        var zoom = 3;
        var map, layer;
 
        var extent = new OpenLayers.Bounds(-130, 25, -65, 50); 

        var options = { controls: [ new OpenLayers.Control.LayerSwitcher(), new OpenLayers.Control.MousePosition() ],
                        restrictedExtent: extent };

        map = new OpenLayers.Map( 'map' , options);
        
        layer = new OpenLayers.Layer.WMS( "OpenLayers WMS", 
               "http://vmap0.tiles.osgeo.org/wms/vmap0",
               {layers: 'basic', sphericalMercator: true} );

        map.addLayer(layer);
        

        //bio_layer = new OpenLayers.Layer.WMS("Bioscatter", 
        //            'http://fire.rccc.ou.edu/cgi-bin/mapserv',
        //            { map: '/scratch/www/map/radar_wms.map',
        //              layers:     'nexrad-unqc_cref',
        //              })

        //map.addLayer(bio_layer)

        map.setCenter(new OpenLayers.LonLat(lon, lat), zoom);
        var geojson_format = new OpenLayers.Format.GeoJSON();
        var vector_layer = new OpenLayers.Layer.Vector(); 
        map.addLayer(vector_layer);
        vector_layer.addFeatures(geojson_format.read(featurecollection));
    
        var select = new OpenLayers.Control.SelectFeature([vector_layer]);
        map.addControl(select);
        select.activate();

        vector_layer.events.on({
                featureselected: function(event) {
                    var feature = event.feature;
                    var id = feature.attributes.commons_id;
                    var name = feature.attributes.loc_id;
                    var output = "<a href='/databrowse/catalog/" + id + "/" + name + "/'>" + name + "</a>";
                    $("#mapinfo").html(output);
                },
                featureunselected: function() {
                    attributes.empty();
                }
            });
        
});

};
