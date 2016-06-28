// Pretend to be a sensor sending data to Vör
var target = "http://futuwear.tunk.org:13337/messages/"

function payload() {
	return {"sensors": {"name": "flex1", "collection": 
		[{"value": Math.floor(Math.random() * 300) + 500  , "timestamp": 0}, 
		 {"value": Math.floor(Math.random() * 300) + 500  , "timestamp": 100}]}} // Stub data
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
