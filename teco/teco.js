function onReady(){    
//    baseurl_auth='http://production.cybercommons.org/'
//    baseurl_workflow ='http://production.cybercommons.org'
    oid='0';
    $('#obs_nee').hide();
    test_auth_tkt();
   // set_cdi();
    loadSites();
    $('#spinner').hide();
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
    init =true;
    //cdi_site = $('#cdi_site').val();
  //  $('#mw').hide();
    //$("#right").height($("#left").height());
    ready_val= false;
    cur_site = 'US-HA1';
    cdi_site = $('#cdi_site').val();
//'{"name":"cybercomq.static.tasks.teco_upload@static","param":""}'
    $('#cdi_site').hide();
    $('#gdi_site').hide();
     $('#AMF_site_grass').hide();
    $('#cdi_opener').hide();
    $('#dafreq').hide();
    $('#grass_upload').hide()
    $('#selectfile').change(function(){
        $('#task').val('{"name":"cybercomq.static.tasks.teco_upload@static","param":"match='+ this.value + '"}');

    });
    $("input[name='teco_file']").change( function() {
        if(get_radio_value('teco_file')=='NEE'){
            $('#selectfile')
                .find('option')
                .remove()
                .end();
                set_cdi();
               // $('#task').val('{"name":"cybercomq.static.tasks.teco_upload@static","param":"match='+ $('#selectfile').val() + '"}');
                $('#obs_nee').show();
           // });
        }else{
            $('#task').val('{"name":"cybercomq.static.tasks.teco_upload@static","param":""}');
            $('#obs_nee').hide();
        }
        //alert("this is sucks");// check input ($(this).val()) for validity here
    });
    $("#mod_weather").click(function() {
        if($('#Model').val()=='grassland'){
            $('#mod_w_txt').val("{'tair':[('add',0)]}");
        }else{
            $('#mod_w_txt').val("{'T_air':[('add',0)]}");
        }
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
    $('#gdi_site').change(function () {
          if (ready_val == true){
             sitechange();
          }
        }).change();
    $('#AMF_site_grass').change(function () {
          if (ready_val == true){
             sitechange();
          }
        }).change();
    $('#cdi_site').change(function () {
        cdi_site = $('#cdi_site').val();
          if (ready_val == true){
             sitechange();
          }
        }).change();
    $('#Model').change(function () {
          if ($('#Model').val() == 'DDA'){
            set_butt();
            $('#dafreq').show();
            //$('#AMF_site').show();
            //$('#AMF_site_grass').hide();
            //$('#siteopener').show();
            $('#mod_w_txt').val("{'T_air':[('add',0)]}");
            sitechange();
            $('#AMF_site_grass').hide();
          }
          else if($('#Model').val() == 'grassland'){
            set_butt();
            $('#mod_w_txt').val("{'tair':[('add',0)]}");
            $('#dafreq').hide();
            //$('#AMF_site').hide();
            //$('#AMF_site_grass').show()
            //$('#siteopener').hide();
            sitechange();
          }
          else{
            set_butt();
            $('#mod_w_txt').val("{'T_air':[('add',0)]}");
            $('#dafreq').hide();
            //$('#AMF_site').show();
            $('#AMF_site_grass').hide()
            //$('#siteopener').show();
            sitechange();
           // $('#mw').hide();
          }
        }).change();
    loadParams(cur_site);
    $('#data-dialog').bind('dialogclose', function(event) {
        setData();
    });
    $("#upload-dialog").bind('dialogclose', function(event) {
        init=true;
        set_cdi();
        if(cdi_site != $('#cdi_site').val()){
        sitechange();
        }
    });
    $('#cdi').click (function (){
        var thisCheck = $(this);
        if($('#Model').val()=='grassland'){
          if (thisCheck.is (':checked')){
            if($('#gdi_site').val()=== null || $('#gdi_site').val()===""){
                alert("Currently no custom data is available. Please click 'Upload Data'");
                $("#runBut").attr("disabled", "disabled");
            }else{
                sitechange();
            }
          }else{

            sitechange();
          }  
        }else{
          cdi_site = $('#cdi_site').val();
          //alert('running');
          if (thisCheck.is (':checked')){
            // Do stuff
            if($('#cdi_site').val()=== null || $('#cd_site').val()===""){
                alert("Currently no custom data is available. Please click 'Upload Data'");
                $("#runBut").attr("disabled", "disabled"); 
            }else{
                //alert('cdi click');
                sitechange();
            }
          }else{
            sitechange();
          }
        }
    });
    function set_cdi(){
        var div;
        if (window.location.hostname == "www.cybercommons.org"){
            var durl="/app/catalog/db_find/cybercom_upload/data/";
        }else{
        //var durl="http://production.cybercommons.org/catalog/db_find/cybercom_upload/data/"
            var durl="/catalog/db_find/cybercom_upload/data/";
        }
        $.getJSON(durl + "{'spec':{'user':'" + String(oid) + "'}}?callback=?",function(data){
            //#alert(data[0]);
            $('#cdi_site').html('');
            $('#selectfile').html('');
            $('#gdi_site').html('');
            init=data
            if(data.length!=0){
            $.each(data[0].task, function() {
                if(this.taskname=='cybercomq.static.tasks.teco_upload_grass'){
                    $('#gdi_site')
                    .append($("<option></option>")
                    .attr("value",this.file)
                    .text(this.file));

                }else{
                    if(this.match){div = '#cdi_site';}else{div = '#selectfile';}
                      $(div)
                        .append($("<option></option>")
                        .attr("value",this.file)
                        .text(this.file));
                    }
                });
                
            }
            if(get_radio_value('teco_file')=='NEE'){
                if($('#selectfile').val()=== null || $('#selectfile').val()===""){
                    $("input[name='teco_file']:eq(0)").attr('checked','checked');
                    $('#task').val('{"name":"cybercomq.static.tasks.teco_upload@static","param":""}');
                    $('#obs_nee').hide();
                    //if(init===false){
                        alert("Please upload Forcing file prior to Observed NEE");
                    //}
                    //init=false;
                }else{
                    $('#task').val('{"name":"cybercomq.static.tasks.teco_upload@static","param":"match='+ $('#selectfile').val() + '"}');
                } 
            }  
            //$('#obs_nee').show();
        });
    }
    function sitechange(){
        cdi_site = $('#cdi_site').val();
        if($('#cdi').is(':checked')){
            if($('#Model').val()=='grassland'){
                $("#gdi_site option:selected").each(function () {
                    JSON_URL=''
                    filepath =''
                    result_id=''
                    $("#runBut").attr("disabled", "disabled");
                    loadParams( $(this).text() );
                    cur_site = $(this).text();
                });
            }else{
                $("#cdi_site option:selected").each(function () {
                    JSON_URL=''
                    filepath =''
                    result_id=''
                    $("#runBut").attr("disabled", "disabled");
                    loadParams( $(this).text() );
                    cur_site = $(this).text();
                });
            }
        }else if ($('#Model').val()=='grassland'){
             $("#AMF_site_grass option:selected").each(function () {
                JSON_URL=''
                filepath =''
                result_id=''
                $("#runBut").attr("disabled", "disabled");
                //alert($(this).val() );
                loadParams( $(this).val() );
                cur_site = $(this).val();
            });
        }else{
            $("#AMF_site option:selected").each(function () {
                JSON_URL=''
                filepath =''
                result_id=''
                $("#runBut").attr("disabled", "disabled");
                loadParams( $(this).text() );
                cur_site = $(this).text();
            });
        }
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
    //custom data input
    $( "#btn_upload" ).button();
    $( "#btn_upload1" ).button();
    $( "#cdi_opener" ).button();
    $( "#cdi_opener" ).click(function() {
        $("#upload-dialog").dialog("open");
    });
    $("#cdi").click(function() {
        set_butt();
    });
    function set_butt(){
        if($('#Model').val()=='grassland'){
            $('#dafreq').hide();
            $('#AMF_site').hide();
            $('#siteopener').hide();
            $('#cdi_site').hide();
            $('#grass_upload').show();
            $('#form_upload').hide();
            if ($('#cdi').is(':checked')){
            $('#cdi_text').text('Custom Site');
            //$('#siteopener').hide();
            //$('#AMF_site').hide();
            //$('#cdi_site').hide();
            $('#cdi_opener').show();
            $('#gdi_site').show();
            $('#AMF_site_grass').hide();
            }else{
            $('#cdi_text').text('Site');
            $('#AMF_site_grass').show();
            $('#gdi_site').hide();
            $('#cdi_opener').hide();
            //$('#AMF_site').hide();
            }
        }else{
            $('#grass_upload').hide();
            $('#form_upload').show();
            if ($('#cdi').is(':checked')){
            $('#gdi_site').hide();
            $('#cdi_text').text('Custom Site');
            $('#siteopener').hide();
            $('#AMF_site').hide();
            $('#cdi_site').show();
            $('#cdi_opener').show();
            }
            else{
            $('#cdi_text').text('Site');
            $('#cdi_site').hide();
            $('#cdi_opener').hide();
            $('#siteopener').show();
            $('#AMF_site').show();
             }
        }
    }
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
    $( "#cdi_opener" ).width($("#fopener").width());
    //$( "#btn_upload" ).width($("#fopener").width());
    //Run Workflow
    $('#runBut').click(function(){
        //processData();
        //$('#loading').show();
        var model = $('#Model').val();
        $('#cr_stat').text("Status: Processing");
        //$('#resultDiv').text("Status: Processing");
        //$('#set_input').css('background-color', 'yellow');
        //$('#run').css('background-color', 'yellow');
        JSON_URL = baseurl_workflow + '/queue/task/' //'http://test.cybercommons.org/queue/task/';
        div_id='#set_input';
        //if (model=='TECO_f1'){
        //    next_obj();
        //}
        //else{
            workflow();
        //}
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
        var Params = "";
        if ($('#cdi').is(':checked')){
            if($('#Model').val()=='grassland'){
                cdi_site = $('#gdi_site').val();
                if(cdi_site=== null || cdi_site===""){
                    alert('Currently, No uploaded data available');
                    $('#pgif').hide();
                    return false;
                } 
            }else{
                cdi_site = $('#cdi_site').val();
                if(cdi_site=== null || cdi_site===""){
                    alert('Currently, No uploaded data available');
                    $('#pgif').hide();
                    return false; 
                }
            }
          Params = "site=" + cdi_site + "&base_yrs=" + base_yrs + "&forecast=" + forc + "&siteparam=" + siteParam + "&model=" + model + "&dda_freq=" + dda_freq + "&upload=" + oid;
        }else{
          if($('#Model').val()=='grassland'){
           Params = "site=" + $('#AMF_site_grass').val() + "&base_yrs=" + base_yrs + "&forecast=" + forc + "&siteparam=" + siteParam + "&model=" + model + "&dda_freq=" + dda_freq; 
          }else{
           Params = "site=" + cur_site + "&base_yrs=" + base_yrs + "&forecast=" + forc + "&siteparam=" + siteParam + "&model=" + model + "&dda_freq=" + dda_freq;
          }
        }
        if ($('#mod_weather').is(':checked')){
           var mdw =  $('#mod_w_txt').val();
            Params = Params + "&mod_weather=" + mdw;
           // alert(Params + " checked");        
        }
       // alert(Params);
        div_id='#run'
        var  url = baseurl_workflow + "/queue/run/cybercomq.model.teco.task.runTECOworkflow/?" + Params //"http://test.cybercommons.org/queue/run/cybercomq.model.teco.task.runTECOworkflow/?" + Params
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
            //"http://test.cybercommons.org/queue/run/cybercomq.model.teco.task.initTECOrun?callback=?&site="
            $.getJSON( baseurl_workflow + "/queue/run/cybercomq.model.teco.task.initTECOrun?callback=?&site=" + Params , function(task){
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
            //'http://test.cybercommons.org/queue/run/cybercomq.model.teco.task.runTeco?callback=?&task_id='
            $.getJSON(baseurl_workflow + '/queue/run/cybercomq.model.teco.task.runTeco?callback=?&task_id=' + filepath, function(task){
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
                                        //'http://test.cybercommons.org/queue/report/'
                                        var res_url= baseurl_workflow + '/queue/report/' + result_id + '/';
                                        $("#result_http").html("<iframe src='" + res_url + "' style='width:100%;height:700px;' ></iframe>");
                                        //$.getJSON('http://test.cybercommons.org/queue/report/' + result_id + '/?callback=?',function(data){
                                        //    $('#result_http' ).html(data.html)
                                            $('#pgif').hide();
                                            historyLoad();
                                            
                                        //} );
                                        }
                    if(div_id=='#set_input'){ $('#set_inputSP').hide(); div_id='#run'}
                    //JSON_URL = 'http://test.cybercommons.org/queue/task/';
                    JSON_URL = baseurl_workflow + '/queue/task/';
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
                        oid=data['user']['id'];
                        var slink = baseurl_auth + "accounts/profile/" 
                        slogout = '<a href="' + slink + '">' + data['user']['name'] + '</a>!';
                        $('#auth_message').html("&nbsp;Welcome " + slogout);
                        set_cdi();
                    }    
                    historyLoad();
             } );
        }
    function setLocations(){
        //'http://test.cybercommons.org/model/getLocations?callback=?'
        $.getJSON(baseurl_workflow +'/model/getLocations?callback=?',function(data){
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
        //$('#siteparam-dialog' ).html('<h1>Loading........</h1>');
        //$.getJSON('http://test.cybercommons.org/model/tecositeparam?site=' + site + '&callback=?',function(data){
        //    $('#siteparam-dialog' ).html(data.html);
        //});
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
        if($('#Model').val()=='grassland'){
            var site_grass = $('#AMF_site_grass').val();
            $('#siteparam-dialog' ).html('<h1>Loading........</h1>');
            //'http://test.cybercommons.org/model/tecositeparam?site='
            $.getJSON( baseurl_workflow + '/model/tecositeparam?site=' + site_grass + '&model=' + $('#Model').val() + '&callback=?',function(data){
                $('#siteparam-dialog' ).html(data.html);
            });
            if( $('#cdi').is(':checked')){
              $('#data-dialog' ).html('<h1>Loading........</h1>');
              var site_grass1 = $('#gdi_site').val();
            //'http://test.cybercommons.org/model/tecodata?site='
              $.getJSON(baseurl_workflow + '/model/tecodata?site=' + site_grass1 + '&model=' + $('#Model').val() + '&upload=' + oid + '&callback=?',function(data){
                    $('#data-dialog' ).html(data.html);
                    setData();
                    $("#runBut").removeAttr("disabled");
                });  


            }else{

                var site_grass = $('#AMF_site_grass').val();
                $('#data-dialog' ).html('<h1>Loading........</h1>');
                //'http://test.cybercommons.org/model/tecodata?site='
                $.getJSON( baseurl_workflow + '/model/tecodata?site=' + site_grass + '&model=' + $('#Model').val() + '&callback=?',function(data){
                    $('#data-dialog' ).html(data.html);
                    setData();
                    $("#runBut").removeAttr("disabled");
                }); 

            }   
            //setData();
            //$("#runBut").removeAttr("disabled");
        }else{
          if( $('#cdi').is(':checked')){
            //alert('yes');
            $('#data-dialog' ).html('<h1>Loading........</h1>');
            //'http://test.cybercommons.org/model/tecodata?site='
            $.getJSON( baseurl_workflow +  '/model/tecodata?site=' + site + '&upload=' + oid + '&callback=?',function(data){
                $('#data-dialog' ).html(data.html);
                setData();
                $("#runBut").removeAttr("disabled");
            });

          }else{
            $('#siteparam-dialog' ).html('<h1>Loading........</h1>');
            //'http://test.cybercommons.org/model/tecositeparam?site='
            $.getJSON( baseurl_workflow + '/model/tecositeparam?site=' + site + '&callback=?',function(data){
                $('#siteparam-dialog' ).html(data.html);
            });
            $('#data-dialog' ).html('<h1>Loading........</h1>');
            $.getJSON( baseurl_workflow + '/model/tecodata?site=' + site + '&callback=?',function(data){
                $('#data-dialog' ).html(data.html);
                setData();
                $("#runBut").removeAttr("disabled");
            });
          }
        }
    }
    function set_file_upload(){
        //fupload Dialog
        $( "#upload-dialog" ).dialog({
            autoOpen: false,
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
        $.getJSON(baseurl_workflow +'/queue/usertasks/["cybercomq.model.teco.task.runTECOworkflow","cybercomq.model.teco.task.runTeco"]/?callback=?',function(data){
                $('#history' ).html(data.html)});
    }
}
