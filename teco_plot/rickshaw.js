var ycol = {
    value: 'SRAD',
    name: 'Solar Radiation'
};

var yvar = 'TAIR'
var ydesc = 'Air Temperature'

var mesonet = {
    element: document.querySelector('#plot'),
    host: 'test.cybercommons.org',
    db: 'mesonet',
    col: 'weather',
    method: 'db_find',
    keys: {
        x: 'observed_date',
        y: yvar
    },
    desc: {
        x: 'Date',
        y: ydesc
    },
    spec: {
        'cat_id': 1472169
    },
    width: 300,
    heigth: 300,
}

var tecorun = {
    element: document.querySelector('#plot'),
    host: 'test.cybercommons.org',
    db: 'teco',
    col: 'taskresults',
    method: 'group_by',
    columns: ['year', 'month'],
    aggregate: 'NPP',
    spec: {
        task_id: '892db074-5e6a-4be0-b94b-a616fe664c8c'
    },
    keys: {
        x: 'month',
        y: 'Sum'
    },
    desc: {
        x: 'Month',
        y: 'Sum of NPP'
    }
}

var mongoURL = function(args) {
    if (args.method === 'group_by') {
        jsonp = "http://" + args.host + "/mongo/" + args.method + "/" + args.db + "/" + args.col + "/" + JSON.stringify(args.columns) + "/" + args.aggregate + "/" + JSON.stringify(args.spec)
    }
    if (args.method === 'db_find') {

        jsonp = "http://" + args.host + "/mongo/" + args.method + "/" + args.db + "/" + args.col + "/{'spec':" + JSON.stringify(args.spec) + ",'fields':['" + args.keys.x + "','" + args.keys.y + "']}/"
    }
    return jsonp
}

var plotGraph = function(args) {
    var graph = new Rickshaw.Graph.JSONP({
        dataURL: mongoURL(args),
        onData: function(d) {
            d.forEach(function(element, index, array) {
                var o = {};
                o.x = new Date(element.observed_date).getTime() / 1000;
                o.y = parseFloat(element[args.keys.y]);
                d[index] = o;
            });
            return [{
                name: args.desc.y,
                data: d
            }];
        },
        element: document.querySelector('#plot'),
        renderer: 'line',
        series: [
            {
            color: 'steelblue',
            name: args.desc.y}
        ],
        onComplete: function(self) {
            var hoverDetail = new Rickshaw.Graph.HoverDetail({
                graph: self.graph
            });
            var ticksTreatment = 'glow';
            var xAxis = new Rickshaw.Graph.Axis.Time({
                graph: self.graph,
                ticksTreatment: ticksTreatment
            });
            var yAxis = new Rickshaw.Graph.Axis.Y({
                graph: self.graph,
                ticksTreatment: ticksTreatment
            });
            yAxis.render();
            xAxis.render();
            var slider = new Rickshaw.Graph.RangeSlider({
                graph: self.graph,
                element: $('#slider')
            });
        }

    });
}

    plotGraph(mesonet);
