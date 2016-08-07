// Pretend to be a sensor sending data to Vör
var target = "http://futuwear.tunk.org:13337/messages/"
var interval = 60 // Milliseconds
var name = "alex"
var serial = "1234"
var uuid = "1:2:3:4"
const crypto = require('crypto');

var variation = 50
var variation1 = 20
var rands = {}

var max = 1000
var min = 0


function rand(id) {
	var random = Math.random()
	var addition = (random - 0.5) * 2 * variation
	var current = isNaN(rands[id]) ? 500 : rands[id]
	current = Math.floor(current + addition)
	if (current > max)
		current = max
	else if (current < min) {
		current = min
	}
	rands[id] = current
	return current//Math.floor(Math.random() * (max - min)) + min
}

var avg = 500
function keepSteady() {
	var random = Math.random()
	var addition = (random - 0.5) * 2 * variation1
	current1 = Math.floor(current1 + addition)
	if (current1 > 525)
		current1 = 525
	else if (current1 < 475) {
		current1 = 475
	}
	return current1//Math.floor(Math.random() * (max - min)) + min
	
}

var current1 = 500

var pressure = 3

var triggerElbow = process.argv.length > 2
if (triggerElbow)
	pressure = 600


function payload() {
	var sensordata = {"sensors": 
			[{
				"name": "Back_X",
				"collection": [{
					"value": keepSteady(0, 1000)
				}]
			},{
				"name": "Back_Y",
				"collection": [{
					"value": rand(1)
				}]
			},{
				"name": "L_Shoulder_X_Rot",
				"collection": [{
					"value": rand(2)
				}]
			},{
				"name": "L_Shoulder_Y_Rot",
				"collection": [{
					"value": rand(3)
				}]
			},{
				"name": "R_Shoulder_X_Rot",
				"collection": [{
					"value": rand(4)
				}]
			},{
				"name": "R_Shoulder_Y_Rot",
				"collection": [{
					"value": rand(5)
				}]
			},{
				"name": "R_Pressure",
				"collection": [{
					"value": pressure
				}]
			}]
		}
	
	var md5 = crypto.createHash('md5')
	var hashPie = JSON.stringify(sensordata["sensors"])
	md5.update(hashPie + uuid + serial);
	sensordata["token"] = md5.digest('hex')
	sensordata["uuid"] = uuid
	sensordata["name"] = name
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
