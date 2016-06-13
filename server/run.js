var port = 8080

// Dependencies
var http = require("http")
var fs = require("fs")
var express = require('express');

var app = express();

// Serve all static files
app.use(express.static('public'));

// Request parsers
var bodyParser = require('body-parser')
app.use(bodyParser.json());       	// to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

function isJSON(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

app.post('/', function (req, res) {
	
	console.log("Data received: " + req.body.data);
	
	var content = req.body.data
	var d = new Date()
	var datestr = d.getTime()
	var filename = "sensordata/packet" + datestr + ".json"; 
	
	if (isJSON(content) && content != "") {
		fs.writeFile(filename, content, function(err) {
			if (err) {
				return console.log("Data save error: " + err);
			}
			console.log("The data was saved.");
		});
		res.send('Thanks!');
	}
	else res.send('Error (JSON-related)')
	
});


app.listen(port, function () {
	console.log('Listening on port ' + port.toString());
});
