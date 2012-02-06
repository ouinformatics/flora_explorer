function onReady(){    

    test_auth_tkt();
    JSON_URL=''
    filepath =''
    result_id=''
    $('#loading').hide();
    $('#set_inputSP').hide();
    $('#runSP').hide();
    $('#runBut').button();
    $('#tabs').tabs();    
    $('#rtabs').tabs();
    $("#right").height($("#left").height());
    historyLoad();
    //$('#runBut').button();
    $('#runBut').click(function(){
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
            var Params = "US-HA1&base_yrs=" + base_yrs + "&forecast=" + forc;  
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
                                            $.getJSON('http://test.cybercommons.org/queue/report/' + filepath + '/?callback=?',function(data){
                                            $('#result_http' ).append(data.html)
                                            } );
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
            $.getJSON('http://test.cybercommons.org/accounts/userdata/?callback=?',function(data){
                    var slink = "http://test.cybercommons.org/accounts/login/?next=".concat(document.URL);
                    if ( data['user']['name'] == "guest"){
                        var slink = "http://test.cybercommons.org/accounts/login/?next=".concat(document.URL);
                        window.location = slink; 
                    }
                    else{
                        var slink = "http://test.cybercommons.org/accounts/login/?next=".concat(document.URL);
                        slogout = '! Click <a href="' + slink + '">logout</a> to login as a differnet user.';
                        $('#auth_message').html("Welcome " + data['user']['name'] + slogout);
                    }    
                    //$('#result_http' ).append(data.html)
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
    function historyLoad(){
        $.getJSON('http://test.cybercommons.org/queue/usertasks/cybercomq.model.teco.task.runTeco?callback=?',function(data){
                    $('#history' ).html(data.html)});
    }
}
