var wsgiURL="/upload_auth/upload/";		//loc: /var/www/apps/ccupload/ccupload.wsgi  - python upload script

function fileSelected(form) {
	if (navigator.appName.search("Microsoft")  >= 0) {
		IE_Upload(form);
	}else{
            var fd = new FormData();
            if($('#Model').val()=='grassland'){
                fd.append('fileToUpload', document.getElementById('fileToUpload_g').files[0]);
                fd.append('dest', document.getElementById('dest_g').value);
                fd.append('task',document.getElementById('task_g').value);
                fd.append('filetype', "fixed_width");
                fd.append('teco_file', 'grass');
            }else{
                fd.append('fileToUpload', document.getElementById('fileToUpload').files[0]);
                fd.append('dest', document.getElementById('dest').value);
                fd.append('task',document.getElementById('task').value);
                fd.append('filetype', get_radio_value('filetype'));
                fd.append('teco_file', get_radio_value('teco_file'));

            }
	    Other_Upload(fd);
	}
}

function IE_Upload(form) {
	// Create the iframe...
	var iframe = document.createElement("iframe");
	iframe.setAttribute("id", "upload_iframe");
	iframe.setAttribute("name", "upload_iframe");
	iframe.setAttribute("width", "0");
	iframe.setAttribute("height", "0");
	iframe.setAttribute("border", "0");
	iframe.setAttribute("style", "width: 0; height: 0; border: none;");
	// Add to document...
	form.parentNode.appendChild(iframe);
	window.frames['upload_iframe'].name = "upload_iframe";
	iframe = document.getElementById("upload_iframe");
	// Add event...
	var eventHandler = function() {
		if (iframe.detachEvent) {
			iframe.detachEvent("onload", eventHandler);
		}else{
			iframe.removeEventListener("load", eventHandler, false);
		}			
		// Message from server...
		if (iframe.contentDocument) {
			content = iframe.contentDocument.body.innerHTML;
		} else if (iframeId.contentWindow) {
			content = iframe.contentWindow.document.body.innerHTML;
		} else if (iframeId.document) {
			content = iframe.document.body.innerHTML;
		}
		$("#progressbar").html('');
		$("#result").text(content);
	}	
	// Set properties of form...
	form.setAttribute("target", "upload_iframe");
	form.setAttribute("action", wsgiURL);
	form.setAttribute("method", "post");
	form.setAttribute("enctype", "multipart/form-data");
	form.setAttribute("encoding", "multipart/form-data");
	if (iframe.addEventListener)
		iframe.addEventListener("load", eventHandler, true);
	if (iframe.attachEvent)
		iframe.attachEvent("onload", eventHandler);
	
	$("#result").text('');
	$("#progressbar").html('<img src="running.gif" alt="">');
	
	// Submit the form...
	form.submit();
}

function Other_Upload(fd) {
	$("#progressbar").progressbar({ value : 0 });

	//var fd = new FormData();
       //fd.append('fileToUpload', document.getElementById('fileToUpload').files[0]);
       //fd.append('dest', document.getElementById('dest').value);
       //fd.append('task',document.getElementById('task').value);
       //fd.append('filetype', get_radio_value('filetype'));
       //fd.append('teco_file', get_radio_value('teco_file'));
	$.ajax({
		 xhr: function() {
			 var xhr = new window.XMLHttpRequest();
			   //Upload progress
			   $("#progressbar").show();
			    xhr.upload.addEventListener("progress", function(evt){
		            if (evt.lengthComputable) {
		                var percentComplete = Math.round(evt.loaded * 100 / evt.total);
		                $("#result").text(percentComplete.toString() + '%');
		                $("#progressbar").progressbar("value", percentComplete);
		            }
		            else {
		            	$("#result").text('unable to compute');
		            }
			    }, false);
			    return xhr;
		 },
		 
		type : 'POST',
		url : wsgiURL,
		data : fd,
		cache: false,
	    contentType: false,
	    processData: false,

		success : function(data) {
			$("#progressbar").hide();
                        
			//$("#down_result").html('Loading Data from file to Database.');//#data);
                        var ddata = JSON.parse(data);
                        //alert(ddata.task_id);
                        if(ddata.task_id=='None'){
                          $("#down_result").html(data);  
                        }else{
                            $("#down_result").html('Loading TECO Data to Database. &nbsp;&nbsp;&nbsp;');
                             poll_status(ddata.task_id);
                        }
		}
	});				
}
function get_radio_value(name){
for (var i=0; i < document.form_upload[name].length; i++)
   {
   if (document.form_upload[name][i].checked)
      {
      return document.form_upload[name][i].value;
      }
   }
}
// Called by call task to poll queue status of task based on task_id
function poll_status(task_id) {
     $.getJSON('http://test.cybercommons.org/queue/task/' + task_id + '?callback=?', 
                    function(data) { 
                        if (data.status == "PENDING") {
                            setTimeout(function() { poll_status(task_id);}, 2000);
                            //$(taskdesc.status).text("Working...");
                            $('#spinner').show();
                        } else if (data.status == "FAILURE") {
                            $('#down_result').text(JSON.stringify(data.result));
                            $('#spinner').hide();
                        } else if (data.status == "SUCCESS") {
                            //$(taskdesc.status).html('<a href="' + data.tombstone[0].result + '">Download</a>');
                            //setTimeout(function() { startDownload(data.tombstone[0].result)}, 3000);
                            //alert(data.tombstone[0].result.description);
                            if(data.tombstone[0].result.status==false){
                                var status = "<br/><b>Status:</b>  ERROR <br/><br/>" + data.tombstone[0].result.description
                            }else{
                                var status = "<br/><b>Status:</b>  SUCCESS <br/><br/>" + data.tombstone[0].result.description
                            }
                            $('#down_result').html(status);
                            $('#spinner').hide();
                        }
                    });
}
