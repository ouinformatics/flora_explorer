function onReady(){    
    baseurl_auth='http://test.cybercommons.org/'
    baseurl_workflow ='http://test.cybercommons.org'
    test_auth_tkt();
    loadSites();
    setLocations();
    JSON_URL=''
    filepath =''
    result_id=''
    $('#loading').hide();
    $('#set_inputSP').hide();
    $('#runSP').hide();
    //$('#opener').button();
    $('#runBut').button();
    $('#tabs').tabs();    
    $('#rtabs').tabs();
    $("#right").height($("#left").height());
    ready_val= false;
    cur_site = 'US-HA1';
    $('#AMF_site').change(function () {
          if (ready_val == true){
            //tecolayer = map.layers[1]
            //selectFeature = new OpenLayers.Control.SelectFeature(tecolayer);
            //tecolayer.features.forEach(function(data){if(data.attributes.loc_id =="US-HA1"){selectFeature.select(data);}});
             sitechange();   
          }
        }).change();
    loadParams(cur_site);
    $('#data-dialog').bind('dialogclose', function(event) {
        setData();
    });
    function sitechange(){
        $("#AMF_site option:selected").each(function () {
                JSON_URL=''
                filepath =''
                result_id=''
                $("#runBut").attr("disabled", "disabled");
                loadParams( $(this).text() );
                cur_site = $(this).text();
            });
    }
    function setData(){
        var baseyear = "(" + $('#Startyear #sortable1 li:eq(0)').html() + "," + $('#Endyear #sortable1 li:eq(0)').html() + ")"
        $('#idata').val(baseyear);
        var flist ='[';
        var total = $('#sortable2 li').length;
        $('#sortable2 li').each(function(index) {
            if(index == total-1){
                flist = flist + "(" +  $(this).text() + ")";
            }
            else{
                flist = flist + "(" +  $(this).text() + "),";
            }
        });
        flist=flist + "]";
        $('#fdata').val(flist);
    }
    $('#site-dialog').bind('dialogclose', function(event) {
        $('#AMF_site').val($('#sitesel').val());
        sitechange();
    });
    $( "#opener" ).button();
    $( "#opener" ).click(function() {
       $('#siteparam-dialog').dialog("open");
    });
    $( "#fopener" ).button();
    $( "#fopener" ).click(function() {
      $('#data-dialog').dialog("open");
    });
    $( "#siteopener" ).button();
    $( "#siteopener" ).click(function() {
      $('#site-dialog').dialog("open");
      map.zoomToMaxExtent();
    });
    $('#site-dialog').bind('dialogopen', function(event) {
        //map.zoomToMaxExtent();
        tecolayer = map.layers[1]
        selectFeature = new OpenLayers.Control.SelectFeature(tecolayer);
        tecolayer.features.forEach(function(data){if(data.attributes.loc_id == $('#AMF_site').val()){selectFeature.select(data);}});
        //map.zoomToMaxExtent();
    });
    //Adjust button width
    $( "#siteopener" ).width($("#fopener").width());
    $( "#opener" ).width($("#fopener").width());
    
    //Run Workflow
    $('#runBut').click(function(){
        //processData();
        //$('#loading').show();
        $('#resultDiv').html("<h1>Status: Processing</h1>");
        $('#set_input').css('background-color', 'yellow');
        $('#run').css('background-color', 'yellow');
        JSON_URL = 'http://test.cybercommons.org/queue/task/';
        div_id='#set_input';
        next_obj();
     });
    function next_obj(){
        if(div_id == '#set_input'){
            $('#loading').show();
            $('#set_inputSP').show();
            $("#right").height($("#left").height());
            //http://test.cybercommons.org/model/teco/setinput
            //http://test.cybercommons.org/model/teco/initTECOrun?callback=?
            //http://test.cybercommons.org/queue/run/cybercomq.model.teco.task.initTECOrun?callback=?
            var base_yrs = $('#idata').val();
            var forc = $('#fdata').val();
            var d = $.param($("#siteparam").serializeArray()).replace(/=/g,"':'").replace(/&/g,"','");
            var siteParam = "{'" + d + "'}"
            //var siteParam 
            var Params = cur_site + "&base_yrs=" + base_yrs + "&forecast=" + forc + "&siteparam=" + siteParam ;  
            $.getJSON("http://test.cybercommons.org/queue/run/cybercomq.model.teco.task.initTECOrun?callback=?&site=" + Params , function(task){
                var j = task ; 
                JSON_URL = JSON_URL + j.task_id + '/?callback=?';
                filepath=j.task_id; 
                ajax_request();});
        }   
        if(div_id == '#run'){
            $('#loading').show();
            $('#runSP').show();
            $("#right").height($("#left").height());
            //'http://test.cybercommons.org/model/teco/run?callback=?&task_id='
            $.getJSON('http://test.cybercommons.org/queue/run/cybercomq.model.teco.task.runTeco?callback=?&task_id=' + filepath, function(task){
                var j = task ;
                result_id = j.task_id 
                JSON_URL = JSON_URL + j.task_id + '/?callback=?'; 
                ajax_request();});
        }
        if(div_id=='#done'){
            $('#loading').hide();
            $("#right").height($("#left").height());
            //alert('TECO model completed successfully.')
        }
    }
    function ajax_request() {
         $.ajax({
                url: JSON_URL, // JSON_URL is a global variable
                dataType: 'json',
                error: function(xhr_data) {
                    // terminate the script
                    $('#loading').hide();
                    alert('errors: ' + xhr_data);
                },
                //beforeSend:function(){ $('#loading').show();},
                success: function(xhr_data) {
                if (xhr_data.status.toLowerCase() == 'pending') {
                // continue polling
                    setTimeout(function() { ajax_request(); }, 3000);
                } else {
                    //$('#loading').hide();
                    $(div_id).css('background-color', 'green');
                    if(div_id=='#run'){ $('#runSP').hide();div_id='#done'; 
                                        $('#resultDiv').html("<h1>Status: " + xhr_data.status + "</h1>");
                                        //var http = xhr_data.tombstone[0].result;//.split("|")[1];
                                        $.getJSON('http://test.cybercommons.org/queue/report/' + result_id + '/?callback=?',function(data){
                                            $('#result_http' ).html(data.html)
                                           /* $.getJSON('http://test.cybercommons.org/queue/report/' + filepath + '/?callback=?',function(data){
                                            $('#result_http' ).append(data.html)
                                            } );*/
                                            historyLoad();
                                        } );
                                        //$.getJSON('http://test.cybercommons.org/queue/report/' + filepath + '/?callback=?',function(data){
                                        //    $('#result_http' ).append(data.html)
                                        //    } );
                                        //$('#result_http' ).html( '&nbsp;' ).getJSON('http://test.cybercommons.org/queue/report/' + filepath + '/?callback=?' );
                                        //$('#result_http').html("<a href='" + http  + "' target='_blank'>TECO Result File</a>");
                                        }
                    //filepath=xhr_data.tombstone[0].result.split("'")[1];
                    if(div_id=='#set_input'){ $('#set_inputSP').hide(); div_id='#run'}
                    JSON_URL = 'http://test.cybercommons.org/queue/task/';
                    next_obj();
                    //$("#right").height($("#left").height());
                }
                },
                contentType: 'application/json'
            });
        }   //class ="ui-widget button "  
    function test_auth_tkt() {
            $.getJSON(baseurl_auth + 'accounts/userdata/?callback=?',function(data){
                    var slink = baseurl_auth + "accounts/login/?next=".concat(document.URL);
                    if ( data['user']['name'] == "guest"){
                        var slink = baseurl_auth + "accounts/login/?next=".concat(document.URL);
                        window.location = slink; 
                    }
                    else{
                        var slink = baseurl_auth + "accounts/profile/" 
                        //logout/?next=".concat(document.URL);
                        //slogout = '! Click <a href="' + slink + '">logout</a> to logout.';
                        slogout = '<a href="' + slink + '">' + data['user']['name'] + '</a>!';
                        $('#auth_message').html("Welcome " + slogout);
                    }    
                    //$('#result_http' ).append(data.html)
                    historyLoad();
             } );
            //$("#auth_dialog").hide()
            //if ($.cookie('auth_tkt') ) {
               // alert("you're logged in");
            //   $('#auth_message').html("You're logged into Cybercommons. Activity is being logged to your account!")
            //}
            //else {
              //  alert("please log in");
                //$("#auth_dialog").dialog( { height:200, modal: true} );
                //$("#auth_dialog").dialog("open");
                //window.location = "http://test.cybercommons.org/accounts/login/?next=".concat(document.URL);
              //  var slink = "http://test.cybercommons.org/accounts/login/?next=".concat(document.URL);
              //  slink='Please <a href="' + slink + '">login</a> to track your tasks via the cybercommons'
              //  $('#auth_message').html(slink); //.addClass('label warning')
           // }

        }
    function setLocations(){
        $.getJSON('http://test.cybercommons.org/model/getLocations?callback=?',function(data){
                $.each(data.location, function(key,value) {   
                    $('#AMF_site')
                        .append($("<option></option>")
                        .attr("value",value)
                        .text(value)); 
                });
            ready_val= true;
        });
    }
    
    function loadParams(site){
        //Site parameter Dialog
        $( "#siteparam-dialog" ).dialog({
            autoOpen: false,
            width:850,
            async:true,
            title:"Site Parameters",
            height:800,
            modal: true,
            buttons: {
                Ok: function() {
                    //alert('yesyesyes');
                    $("#siteparam-dialog").dialog("close");
                }
            }
        });
        $('#siteparam-dialog' ).html('<h1>Loading........</h1>');
        $.getJSON('http://test.cybercommons.org/model/tecositeparam?site=' + site + '&callback=?',function(data){
            $('#siteparam-dialog' ).html(data.html);
        });
        //Data Dialog
        $( "#data-dialog" ).dialog({
            autoOpen: false,
            width:1010,
            async:true,
            title:"Forcing Parameters",
            height:700,
            modal: true,
            buttons: {
                Ok: function() {
                    //alert('yesyesyes');
                    $("#data-dialog").dialog("close");
                }
            }
        });
        $('#data-dialog' ).html('<h1>Loading........</h1>');
        $.getJSON('http://test.cybercommons.org/model/tecodata?site=' + site + '&callback=?',function(data){
            $('#data-dialog' ).html(data.html);
            setData();
            $("#runBut").removeAttr("disabled");
        });
    }
    function loadSites(){
      //  $.getJSON('http://test.cybercommons.org/model/getSite?callback=?',function(data){
       //        $('#site-dialog' ).html(data.html);
        //    setData();
       // });
        $( "#site-dialog" ).dialog({
            autoOpen: false,
            width:1010,
            async:true,
            title:"Site Location Map",
            height:750,
            modal: true,
            buttons: {
                Ok: function() {
                    //alert('yesyesyes');
                    $("#site-dialog").dialog("close");
                }
            }
        });
        //$('#site-dialog').load('map.html');
        //$.getJSON('http://test.cybercommons.org/model/getSite?callback=?',function(data){
        //    $('#site-dialog' ).html(data.html);
        //    setData();
       // });
    }
    function historyLoad(){
        $.getJSON('http://test.cybercommons.org/queue/usertasks/cybercomq.model.teco.task.runTeco?callback=?',function(data){
                    $('#history' ).html(data.html)});
    }
/*    function onPopupClose(evt) {
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
                "<b>"+feature.attributes.loc_name + "</b><hr><table>" +
                "<tr><th>ID</th><td>"+feature.attributes.loc_id + "</td></tr>" +
                "<tr><th>Type</th><td>"+feature.attributes.loc_purpose + "</td></tr>" +
                "<tr><th>State</th><td>"+feature.attributes.loc_state + "</td></tr>" +
                "<tr><th>Country</th><td>"+feature.attributes.loc_county + "</td></tr>" +
                "<tr><td colspan='2'><a href='"+feature.attributes.site_url + "' target='_blank'>AmeriFlux Site Description</a></td></tr>" +
                "<tr><td colspan='2'><a href='http://maps.google.com/maps?z=15&t=k&q=loc:"+feature.attributes.lat+","+feature.attributes.lon+"' target='_blank'>Google Maps</a></td></tr></table>" ,
                null, true, onPopupClose);
    
        feature.popup = popup;
        popup.feature = feature;
        map.addPopup(popup, true);
   
        var id = (feature.attributes.loc_id) ? feature.attributes.loc_id : '';
        $("#mapinfo").html("<input type='hidden' id='sitesel' value='" + id + "'>" + id);   
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
*/
}
