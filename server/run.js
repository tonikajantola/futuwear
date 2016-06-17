const UI_PORT = 8080	// Port to serve HTML UI on
const SOCKET_SERVER = "http://futuwear.tunk.org:13337/"; // Where to listen to Vör messages

// Dependencies
const http = require("http")
const fs = require("fs")
const express = require('express');
const socketIO = require('socket.io-client');

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
app.get('/fetch', function (req, res) {
	
	var content = req.body
	
	var feedback = lastMessage
	
	res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(feedback, null, 3));	
});


app.listen(UI_PORT, function () {
	console.log('Serving on port ' + UI_PORT.toString());
});

var lastMessage = {}


// connect to socket server
const client = socketIO.connect(SOCKET_SERVER);
client.on('connect', () => console.log(`Connected to Vör socket ${SOCKET_SERVER}`));
client.on('disconnect', () => console.log(`Client socket disconnected ${SOCKET_SERVER} :  ${new Date()}`));
client.on('reconnect_attempt', error => console.error(`Error - cannot connect to ${SOCKET_SERVER} : ${error} : ${new Date()}`));
client.on('error', error => console.error(`Error - socket connection: ${error} : ${new Date()}`));

client.on('message', msg => {
	lastMessage = msg
	console.log(`Message from vör: ${JSON.stringify(lastMessage)}`)
});

