function onReady(){    
    baseurl_auth='http://test.cybercommons.org/'
    baseurl_workflow ='http://test.cybercommons.org'
    test_auth_tkt();
    loadSites();
    set_file_upload();
    setLocations();
    JSON_URL=''
    filepath =''
    result_id=''
    $('#loading').hide();
    $('#set_inputSP').hide();
    $('#runSP').hide();
    $('#pgif').hide();
    $('#left').hide();
    $('#runBut').button();
    $('#tabs').tabs();    
    $('#rtabs').tabs();
    $('#mod_w_txt').hide();
  //  $('#mw').hide();
    //$("#right").height($("#left").height());
    ready_val= false;
    cur_site = 'US-HA1';
    $("#mod_weather").click(function() {
        if ($('#mod_weather').is(':checked')){
            $('#mod_w_txt').show();
        }
        else{$('#mod_w_txt').hide(); }
    });
    $('#AMF_site').change(function () {
          if (ready_val == true){
             sitechange();   
          }
        }).change();
    $('#Model').change(function () {
          if ($('#Model').val() == 'DDA'){
            $('#dafreq').show();
           // $('#mw').show();
          }
          else{
            $('#dafreq').hide();
           // $('#mw').hide();
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
        if ( $('#AMF_site').val() != $('#sitesel').val()){
        $('#AMF_site').val($('#sitesel').val());
        sitechange();
        }
    });
    $( "#opener" ).button();
    $( "#opener" ).click(function() {
        //$( "#siteparam-dialog" ).dialog( "option", "width", 1010 );
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
        var model = $('#Model').val();
        $('#cr_stat').text("Status: Processing");
        //$('#resultDiv').text("Status: Processing");
        //$('#set_input').css('background-color', 'yellow');
        //$('#run').css('background-color', 'yellow');
        JSON_URL = 'http://test.cybercommons.org/queue/task/';
        div_id='#set_input';
        if (model=='TECO_f1'){
            next_obj();}
        else{
            workflow();
        }
     });
    function workflow(){
        $('#pgif').show();
        $('#cur_stat').text("TECO Workflow");
        //$('#set_inputSP').show();
        var base_yrs = $('#idata').val();
        var forc = $('#fdata').val();
        var d = $.param($("#siteparam").serializeArray()).replace(/=/g,"':'").replace(/&/g,"','");
        var siteParam = "{'" + d + "'}"
        var model = $('#Model').val();
        var dda_freq = $('#dda_freq').val();
        var Params = "site=" + cur_site + "&base_yrs=" + base_yrs + "&forecast=" + forc + "&siteparam=" + siteParam + "&model=" + model + "&dda_freq=" + dda_freq;
        if ($('#mod_weather').is(':checked')){
           var mdw =  $('#mod_w_txt').val();
            Params = Params + "&mod_weather=" + mdw;
           // alert(Params + " checked");        
        }
       // alert(Params);
        div_id='#run'
        var  url ="http://test.cybercommons.org/queue/run/cybercomq.model.teco.task.runTECOworkflow/?" + Params
        //alert(url);
            $.getJSON(url, function(task){
                var j = task ;
                JSON_URL = JSON_URL + j.task_id + '/?callback=?';
                filepath=j.task_id;
                result_id = j.task_id
                ajax_request();});    
    }
    function next_obj(){
        if(div_id == '#set_input'){
            //$('#loading').show();
            $('#pgif').show();
            $('#cur_stat').text("Initialize TECO Model");
            //$('#set_inputSP').show();
            //$("#right").height($("#left").height());
            var base_yrs = $('#idata').val();
            var forc = $('#fdata').val();
            var d = $.param($("#siteparam").serializeArray()).replace(/=/g,"':'").replace(/&/g,"','");
            var siteParam = "{'" + d + "'}"
            //var siteParam 
            var model = $('#Model').val();
            var Params = cur_site + "&base_yrs=" + base_yrs + "&forecast=" + forc + "&siteparam=" + siteParam + "&model=" + model;  
            if ($('#mod_weather').is(':checked')){
                var mdw =  $('#mod_w_txt').val();
                Params = Params + "&mod_weather=" + mdw;
                // alert(Params + " checked");        
            }
            $.getJSON("http://test.cybercommons.org/queue/run/cybercomq.model.teco.task.initTECOrun?callback=?&site=" + Params , function(task){
                var j = task ; 
                JSON_URL = JSON_URL + j.task_id + '/?callback=?';
                filepath=j.task_id; 
                ajax_request();});
        }   
        if(div_id == '#run'){
            //$('#loading').show();
            //$('#runSP').show();
            $('#pgif').show();
            $('#cur_stat').text("Running TECO Model");
            //$("#right").height($("#left").height());
            $.getJSON('http://test.cybercommons.org/queue/run/cybercomq.model.teco.task.runTeco?callback=?&task_id=' + filepath, function(task){
                var j = task ;
                result_id = j.task_id 
                JSON_URL = JSON_URL + j.task_id + '/?callback=?'; 
                ajax_request();});
        }
        if(div_id=='#done'){
            //$('#loading').hide();
            //$("#right").height($("#left").height());
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
                success: function(xhr_data) {
                if (xhr_data.status.toLowerCase() == 'pending') {
                // continue polling
                    setTimeout(function() { ajax_request(); }, 3000);
                } else {
                   // $(div_id).css('background-color', 'green');
                    if(div_id=='#run'){ $('#runSP').hide();div_id='#done'; 
                                        $('#cr_stat').text("Status: " +  xhr_data.status );
                                        var res_url='http://test.cybercommons.org/queue/report/' + result_id + '/';
                                        $("#result_http").html("<iframe src='" + res_url + "' style='width:100%;height:700px;' ></iframe>");
                                        //$.getJSON('http://test.cybercommons.org/queue/report/' + result_id + '/?callback=?',function(data){
                                        //    $('#result_http' ).html(data.html)
                                            $('#pgif').hide();
                                            historyLoad();
                                            
                                        //} );
                                        }
                    if(div_id=='#set_input'){ $('#set_inputSP').hide(); div_id='#run'}
                    JSON_URL = 'http://test.cybercommons.org/queue/task/';
                    next_obj();
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
                        slogout = '<a href="' + slink + '">' + data['user']['name'] + '</a>!';
                        $('#auth_message').html("&nbsp;Welcome " + slogout);
                    }    
                    historyLoad();
             } );
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
            width:1069,
            async:true,
            title:"Site Parameters",
            height:795,
            modal: true,
            buttons: {
                Ok: function() {
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
    function set_file_upload(){
        //fupload Dialog
        $( "#upload-dialog" ).dialog({
            autoOpen: true,
            width:800,
            async:true,
            title:"TECO File Upload",
            height:700,
            modal: true,
            buttons: {
                Ok: function() {
                    $("#upload-dialog").dialog("close");
                }
            }
        });
    }
    function loadSites(){
        $( "#site-dialog" ).dialog({
            autoOpen: false,
            width:1010,
            async:true,
            title:"Site Location Map",
            height:750,
            modal: true,
            buttons: {
                Ok: function() {
                    $("#site-dialog").dialog("close");
                }
            }
        });
    }
    function historyLoad(){
        //var hist_url='http://production.cybercommons.org/queue/usertasks/["cybercomq.model.teco.task.runTECOworkflow","cybercomq.model.teco.task.runTeco"]'
        //$("#history").html("<iframe src='" + hist_url + "' style='width:100%;height:700px;' ></iframe>");
        $.getJSON('http://test.cybercommons.org/queue/usertasks/["cybercomq.model.teco.task.runTECOworkflow","cybercomq.model.teco.task.runTeco"]/?callback=?',function(data){
                $('#history' ).html(data.html)});
    }
}
