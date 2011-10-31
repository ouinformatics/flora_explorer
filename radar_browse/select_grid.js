var data = [];
var grid;
var columns = [
    {id: "commons_id", name: "Commons Id", field: 'commons_id'},
    {id: "loc_id", name: "Location", field: 'loc_id'}
];

var options = { enableCellNavigation: true, enableColumnReorder: true};

$(function() {grid = new Slick.Grid("#locgrid", data, columns, options);});
$("#locgrid").show(); 




