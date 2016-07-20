// Pretend to be a sensor sending data to Vör
var target = "http://futuwear.tunk.org:13337/messages/"
var interval = 60 // Milliseconds
var serial = "Rand0mSens0rSerialNumber"
const crypto = require('crypto');

var variation = 40


function rand(min, max) {
	var random = Math.random()
	var addition = (random - 0.5) * 2 * variation
	current = Math.floor(current + addition)
	if (current > max)
		current = max
	else if (current < min) {
		current = min
	}
	return current//Math.floor(Math.random() * (max - min)) + min
}


var current = 500


function payload() {
	var sensordata = {"sensors": 
			[{
				"id": "elmon-sensori_787167", 
				"name": "Back_X",
				"collection": [{
					"value": rand(0, 1000)
				}]
			}]
		}
	var md5 = crypto.createHash('md5')
	var hashPie = JSON.stringify(sensordata["sensors"])
	md5.update(hashPie + serial);
	sensordata["token"] = md5.digest('hex')
	return sensordata;
}

var request = require('request');


setInterval(function () {
	var options = {
	  uri: target,
	  method: 'POST',
	  json: payload()
	};
	
	request(options, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
		console.log(response.body)
	  }
	  else console.log("Could not complete the request.")
	});
}, interval)
