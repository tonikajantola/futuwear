var http = require("http")
var fs = require("fs")

var port = 8080

var express = require('express');
var app = express();

app.use(express.static('public'));


// Request parsers
var bodyParser = require('body-parser')
app.use(bodyParser.json());       	// to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

/*http://stackoverflow.com/questions/3710204/how-to-check-if-a-string-is-a-valid-json-string-in-javascript-without-using-try */
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
	var filename = "sensordata/packet" + Math.random() + ".json"; 
	
	
	if (isJSON(content)) {
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


