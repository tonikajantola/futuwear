// Pretend to be a sensor sending data to Vör
var target = "http://futuwear.tunk.org:13337/messages/"
var interval = 1000 // Milliseconds
var serial = "Rand0mSens0rSerialNumber"
const crypto = require('crypto');



function rand(min, max) {
	return Math.floor(Math.random() * (max - min)) + min
}



function payload() {
	var sensordata = {"sensors": 
			[{
				"name": "flex1", 
				"collection": [{
					"value": rand(0, 1000)
				}]
			}, {
				"name": "flex2", 
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
