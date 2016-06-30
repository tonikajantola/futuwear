// Pretend to be a sensor sending data to Vör
var target = "http://futuwear.tunk.org:13337/messages/"

function rand(min, max) {
	return Math.floor(Math.random() * (max - min)) + min
}

function payload() {
	return {"sensors": 
			[{
				"name": "flex1", 
				"collection": [{
					"value": rand(500, 800)
				}]
			}, {
				"name": "flex2", 
				"collection": [{
					"value": rand(500, 800)
				}]
			}]
		}
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
}, 100)
