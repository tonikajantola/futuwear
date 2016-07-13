

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