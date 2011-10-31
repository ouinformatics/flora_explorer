$( document ).ready( function() {
var show_data= [];
var plot_data = [];
$.getJSON('http://fire.rccc.ou.edu/mongo/db_find?callback=?', { db: "flora", col: "data", query: "{}" },
	function(data) { 
        
        $.each(data, 
            function(i, val) { 
				point=[ Math.log(parseFloat(val.Area_hectares)),  Math.log(parseFloat(val.NO_Species)) ]
                plot_data.push(point)
				show_data.push(val)
            }
        );
		var plot_options=
		{
		lines: { show: false },
		points: { show: true },
		grid:{clickable: true}
		}
		$.plot($('#plot'), [plot_data], plot_options);
        
});

			
});
