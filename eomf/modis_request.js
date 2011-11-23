$(document).ready(function(){

$("#spinner").hide()

products = [
  {
    "cat_id": 1452140, 
    "cat_name": "MOD09A1_aerosolmask"
  }, 
  {
    "cat_id": 1452141, 
    "cat_name": "MOD09A1_blue"
  }, 
  {
    "cat_id": 1452142, 
    "cat_name": "MOD09A1_phenology"
  }, 
  {
    "cat_id": 1452143, 
    "cat_name": "MOD09A1_ndwi"
  }, 
  {
    "cat_id": 1452144, 
    "cat_name": "MOD09A1_ndsi"
  }, 
  {
    "cat_id": 1452145, 
    "cat_name": "MOD09A1_snow"
  }, 
  {
    "cat_id": 1452146, 
    "cat_name": "MOD09A1_cloudmask"
  }, 
  {
    "cat_id": 1452147, 
    "cat_name": "MOD09A1_oceanmask"
  }, 
  {
    "cat_id": 1452148, 
    "cat_name": "MOD09A1_lswi"
  }, 
  {
    "cat_id": 1452149, 
    "cat_name": "MOD09A1_evi"
  }, 
  {
    "cat_id": 1452150, 
    "cat_name": "MOD09A1_ndvi"
  }
]

pickproduct = $("#product");
$.each(products, function() {
    pickproduct.append($("<option/>").val(this.cat_name).text(this.cat_name));
});

// Get list of countries to pick from
$.getJSON('http://test.cybercommons.org/mongo/db_find/eomf/countries/{"sort":[("country_name",1)]}?callback=?', 
    function(countries) {
        pickcountry = $("#country");
        $.each(countries, function() {
            pickcountry.append($("<option/>").val(this.country_code).text(this.country_name));
        });
    }
);

$(".datepick").change(function() { $(".datepick").datepicker("option", "dateFormat", 'yy-mm-dd');} );
$("#start_date").datepicker({ minDate: new Date(2000,2-1,24), changeYear: true }); 
$("#end_date").datepicker({ minDate: new Date(2000,2-1,24), changeYear: true } );


taskdesc = { 
    "taskname":   'cybercomq.static.tasks.modiscountry',
    "taskq":      'static',
    "uiparams":   ['#product','#country','#start_date','#end_date'],// UI Selected
    "status":     '#status',
    "spinner":    '#spinner',
    "pollinterval": 2000,
};


$(".button").click( function() {calltask(taskdesc);} );

});


