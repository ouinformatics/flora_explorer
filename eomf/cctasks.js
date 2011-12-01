// Some helpers for running Cybercommons Tasks

// Should point to queue submission target
var SERVICE_HOST = 'http://test.cybercommons.org/queue/run/'

// Configuration object for calling cybercom queue tasks.
// Parameters can be specified in [params] list object, or a special list of 
// jQuery selectors can be provided to grab the current values of these form elements at run-time.
/*
taskdesc = { 
    "taskname":   'cybercomq.static.tasks.modiscountry',
    "taskq":      'static',
    "params":     ['MOD09A1_ndvi','MX','2010-10-10','2010-11-1'],   // Fixed params 
    "uiparams":   ['#product','#country','#start_date','#end_date'],// UI Selected
    "status":     '#status',
    "spinner":    '#spinner',
    "pollinterval": 2000,
}

*/



function startDownload(url) {
  window.open(url,'Download')
}


// Called by call task to poll queue status of task based on task_id
function poll_status(task_id) {
     $.getJSON('http://test.cybercommons.org/queue/task/' + task_id + '?callback=?', 
                    function(data) { 
                        if (data.status == "PENDING") {
                            setTimeout(function() { poll_status(task_id);}, taskdesc.pollinterval);
                            $(taskdesc.status).show();
                            $(taskdesc.status).removeClass('label success warning important').addClass('label warning');
                            $(taskdesc.status).text("Working...");
                            $(taskdesc.spinner).show();
                        } else if (data.status == "FAILURE") {
                            $(taskdesc.status).show();
                            $(taskdesc.status).removeClass('label success warning important').addClass('label important');
                            $(taskdesc.status).text("Task failed!");
                            $(taskdesc.spinner).hide();
                        } else if (data.status == "SUCCESS") {
                            $(taskdesc.status).show();
                            $(taskdesc.status).removeClass('label success warning important').addClass('label success');
                            $(taskdesc.status).html('<a href="' + data.tombstone[0].result + '">Download</a>');
                            //setTimeout(function() { startDownload(data.tombstone[0].result)}, 3000);
                            $(taskdesc.spinner).hide();
                        }
                    });
}

function calltask(taskdesc) {
    var taskparams = ""
    if (taskdesc.params) {
        for (item in taskdesc.params) {
            taskparams=taskparams.concat('/' + taskdesc.params[item]);
        }
    }
    else if (taskdesc.uiparams) {
        for (item in taskdesc.uiparams) {
            taskparams = taskparams.concat('/' + $(taskdesc.uiparams[item]).val() );
        }
    }
    var taskcall = ""
    if (taskdesc.taskq) {
        taskcall = taskdesc.taskname + '@' + taskdesc.taskq;
    } else {
        taskcall = taskdesc.taskname;
    }

    var request = SERVICE_HOST + taskcall + taskparams;

    $.getJSON(request + '?callback=?', 
        function(data) { 
            $(taskdesc.status).text('Task submitted...');
            var task_id = data.task_id;
            setTimeout(function() { poll_status(task_id);}, taskparams.pollinterval); 
    });
}
