

/* A function to validate any object into a JSON object, defaulting to {}*/
function json(data) {
	try {
		if (typeof data == "string")
			return JSON.parse(data)
		else if (typeof JSON.parse(JSON.stringify(data)) == "object")
			return data
		else throw new Error("")
	} catch (e) {
		console.log("JSON data is faulty, calling it {}")
		return {}
	}
}

// FROM http://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
		function timeSince(date) {

			var seconds = Math.floor((new Date() - date) / 1000);

			var interval = Math.floor(seconds / 31536000);

			if (interval > 1) {
				return interval + " years";
			}
			interval = Math.floor(seconds / 2592000);
			if (interval > 1) {
				return interval + " months";
			}
			interval = Math.floor(seconds / 86400);
			if (interval > 1) {
				return interval + " days";
			}
			interval = Math.floor(seconds / 3600);
			if (interval > 1) {
				return interval + " hours";
			}
			interval = Math.floor(seconds / 60);
			if (interval > 1) {
				return interval + " minutes";
			}
			return Math.floor(seconds) + " seconds";
		}
		


function createCookie(name,value,days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function removeCookie(name) {
    createCookie(name,"",-1);
}


function appendVisualiser(viewContainer, sensorID, sensorName, containerID) {
	if (typeof viewContainer[sensorID] != "function") {
		$("#" + containerID).append('<div class="col-xs-2" data-toggle="tooltip" title="'+sensorName+'" style="text-align:center;"><input type="text" id="sensor-'+sensorName+'" value="0" class="dial" data-fgColor="#66CC66" data-angleOffset=-125 data-angleArc=250 data-width="80%"></div>')
		$('[data-toggle="tooltip"]').tooltip();
		
		$("#sensor-" + sensorName).knob({
			'min': 0,
			'max': 1000,
			'readOnly': true,
			'displayPrevious': true
		});
		
		var domify = function (newVal) {
			$("#sensor-" + sensorName)
				.val(newVal)
				.trigger('change');
		}						
		
		viewContainer[sensorID] = function(newVal) {
		
			if (sensorName.indexOf("_") > -1) // Assuming Torso-related names always have an underscore
				postToFrame(sensorName, newVal)
			
			domify(newVal)
			
		}
	}
}


function devices() {
	var devices = readCookie("devices")
	if (!devices) return []
	
	return devices.split(',')
}

function postToFrame(callbackID, sensorValue) {
	if (!torsoVisible) {
		$("#torso_wrapper").show()
		torso.src = 'torso/index.html'
		torsoVisible = true
	}
	var context = torso.contentWindow.animator
	var success = false
	if (!!callbackID && typeof sensorValue != "undefined") {
		success = context.sensor_update_degree(callbackID, 0, 1000, sensorValue)
		context.rotate_all()
	}
	return success;
}
var torsoVisible = false
var bounds = {min: 0, max: 1000}
var views = {} // List of callback functions




		
		
function timeString(hours, minutes, seconds) {
	var clock = [hours, minutes, seconds]
	clock = clock.map(function (digit) {
		if (digit.toString().length == 1)
			return "0" + digit;
		else return digit
	})
	return clock.join(":")
}
