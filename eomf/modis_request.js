$(document).ready(function(){

$("#spinner").hide()

products = [{"cat_name":'MOD09A1_evi'}, {"cat_name":'MOD09A1_lswi'}, {"cat_name": "MOD09A1_ndvi"}]

// Get list of countries to pick from
$.getJSON('http://test.cybercommons.org/mongo/db_find/eomf/countries/{"sort":[("country_name",1)]}?callback=?', 
    function(countries) {
        pickcountry = $("#country");
        $.each(countries, function() {
            pickcountry.append($("<option/>").val(this.country_code).text(this.country_name));
        });
    }
);

pickproduct = $("#product");
$.each(products, function() {
    pickproduct.append($("<option/>").val(this.cat_name).text(this.cat_name));
});


$(".datepick").change(function() { $(".datepick").datepicker("option", "dateFormat", 'yy-mm-dd');} );
$("#start_date").datepicker({ minDate: new Date(2000,2-1,24), changeYear: true }); 
$("#end_date").datepicker({ minDate: new Date(2000,2-1,24), changeYear: true } );

function startDownload(url) {
  window.open(url,'Download')
}


var URL = 'http://test.cybercommons.org/queue/run/cybercomq.static.tasks.modiscountry@static/';

function poll_status(task_id) {
     $.getJSON('http://test.cybercommons.org/queue/task/' + task_id + '?callback=?', 
                    function(data) { 
                        if (data.status == "PENDING") {
                            setTimeout(function() { poll_status(task_id);}, 2000);
                            $("#status").text("Working...");
                            $("#spinner").show();
                        } else if (data.status == "FAILURE") {
                            $("#status").text(data.status);
                            $("#spinner").hide();
                        } else if (data.status == "SUCCESS") {
                            $("#status").html('<a href="' + data.tombstone[0].result + '">Download</a>');
                            setTimeout(function() { startDownload(data.tombstone[0].result)}, 3000);
                            $("#spinner").hide();
                        }
                    });
}

function run_task() { 
            var urlstring = URL + $("#product").val() +'/'+ $("#country").val() + '/' + $("#start_date").val() + '/' + $("#end_date").val();
            $("#spinner").show();
            $.getJSON(urlstring + '?callback=?', function(data) {
                $("#status").text("Task submitted...");
                var task_id = data.task_id;
                //$("#tombstone").text("http://fire.rccc.ou.edu/mongo/db_find/cybercom_queue/cybercom_queue_meta/{'spec':{'_id':'"+ task_id +"'}}");
                setTimeout(function() {poll_status(task_id);}, 5000 );
            }) 
}; 

     
$(".button").click( function() {run_task();} );


$("#URL").bind('URL_update', function() {
        var urlstring = URL + $("#product").val() +'/'+ $("#country").val() + '/' + $("#start_date").val() + '/' + $("#end_date").val()
        //$("#URL").html('<a href="' + urlstring + '">'+ urlstring + '</a>' )
});



});


