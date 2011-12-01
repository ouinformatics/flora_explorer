// Some helpers for running Cybercommons Tasks

// Should point to queue submission target
var SERVICE_HOST = 

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
                            options.onPending(task_id);                            
                        } else if (data.status == "FAILURE") {
                            options.onFailure(data);
                        } else if (data.status == "SUCCESS") {
                            options.onSuccess(data);
                        }
                    });
}

function calltask(taskdesc) {
    defaults = {
       "service_host": 'http://test.cybercommons.org/queue/run/',
       "status":     '#status',
       "spinner":    '#spinner',
       "pollinterval": 2000,
       "onPending": function(task_id) {
            setTimeout(function() { poll_status(task_id);}, options.pollinterval);
            $(options.status).show();
            $(options.status).removeClass('label success warning important').addClass('label warning');
            $(options.status).text("Working...");
            $(options.spinner).show();
        },
       "onFailure": function(data) {
             $(options.status).show();
             $(options.status).removeClass('label success warning important').addClass('label important');
             $(options.status).text("Task failed!");
             $(options.spinner).hide();
        },
       "onSuccess": function(data) { 
                $(options.status).show();
                $(options.status).removeClass('label success warning important').addClass('label success');
                $(options.status).html('<a href="' + data.tombstone[0].result + '">Download</a>');
                $(options.spinner).hide();
            },
        }
    options = $.extend(true, {}, defaults, taskdesc)

    var taskparams = ""
    if (options.params) {
        for (item in options.params) {
            taskparams=taskparams.concat('/' + options.params[item]);
        }
    }
    else if (options.uiparams) {
        for (item in options.uiparams) {
            taskparams = taskparams.concat('/' + $(options.uiparams[item]).val() );
        }
    }
    var taskcall = ""
    if (options.taskq) {
        taskcall = options.taskname + '@' + options.taskq;
    } else {
        taskcall = options.taskname;
    }

    var request = options.service_host + taskcall + taskparams;

    $.getJSON(request + '?callback=?', 
        function(data) { 
            $(options.status).text('Task submitted...');
            var task_id = data.task_id;
            setTimeout(function() { poll_status(task_id);}, taskparams.pollinterval); 
    });
}
