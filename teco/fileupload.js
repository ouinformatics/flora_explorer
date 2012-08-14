var wsgiURL="/ccupload/";		//loc: /var/www/apps/ccupload/ccupload.wsgi  - python upload script

function fileSelected(form) {
	if (navigator.appName.search("Microsoft")  >= 0) {
		IE_Upload(form);
	}else{
		Other_Upload();
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

function Other_Upload() {
	$("#progressbar").progressbar({ value : 0 });

	var fd = new FormData();
       fd.append('fileToUpload', document.getElementById('fileToUpload').files[0]);
       fd.append('dest', document.getElementById('dest').value);
		
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
			$("#result").text(data);
		}
	});				
}
