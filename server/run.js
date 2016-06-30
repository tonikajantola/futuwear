const UI_PORT = 8080	// Port to serve HTML UI on
const SOCKET_SERVER = "http://futuwear.tunk.org:13337/"; // Where to listen to Vör messages

// Dependencies
const http = require("http")
const fs = require("fs")
const express = require('express');
const socketIO = require('socket.io-client');
const mysql = require('mysql');
const crypto = require('crypto');

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

/* Method to get old data with */
app.get('/fetch', function (req, res) {
	
	var content = req.query.data // TODO: Safety
		
	//console.log("Got fetched: " + content)
	content = JSON.parse(content)
	
	getData(parseInt(content.time0), parseInt(content.timeT), res)
});


app.listen(UI_PORT, function () {
	console.log('Serving on port ' + UI_PORT.toString());
});

var lastMessage = {}


///////////////////////////
// Connect to Vör socket //
///////////////////////////


const client = socketIO.connect(SOCKET_SERVER);
client.on('connect', () => console.log(`Connected to Vör socket ${SOCKET_SERVER}`));
client.on('disconnect', () => console.log(`Client socket disconnected ${SOCKET_SERVER} :  ${new Date()}`));
client.on('reconnect_attempt', error => console.error(`Error - cannot connect to ${SOCKET_SERVER} : ${error} : ${new Date()}`));
client.on('error', error => console.error(`Error - socket connection: ${error} : ${new Date()}`));

client.on('message', msg => {
	
	console.log(`Message from vör: ${JSON.stringify(msg)}`)
	
	var sensors = json(msg)["sensors"]
	
	try {
		var hashPie = JSON.stringify(sensors)
		var md5 = crypto.createHash('md5')
		var serial = "Rand0mSens0rSerialNumber" // TODO: Get from database
		md5.update(hashPie + serial);
		var computedHash = md5.digest('hex')
		var receivedHash = json(msg)["token"]
		
		
		if (computedHash != receivedHash)
			throw new Error("Received hash " + receivedHash + " didn't match the computed hash " + computedHash)
		
		if (!sensors[0]) {
			sensors = [sensors]
		}
		console.log("Got a vör message with readings from " + sensors.length + " sensor(s).")
		for (var i = 0; i < sensors.length; i++) {
			var sensor = sensors[i]
			
			for (var j = 0; j < sensor["collection"].length; j++) {
				var value = parseInt(sensor["collection"][j]["value"])
				if (!saveData(sensor["name"], value))
					registerSensor(sensor["name"], "Auto-added Sensor")  // TODO: require a separate registration
			}
		}
	} catch (e) {
		console.log("Data save problem: " + e.message)
	}
	
});


/////////////////////////
// Manage the database //
/////////////////////////

const db = require("./connection-strings")
const c = mysql.createConnection(db);
c.connect(function(err){
	if(err){
		console.log('Error connecting to Db: ' + err.message);
		return;
	}
	console.log('Database connection established');
});

function getData(time0, timeT, responder) {
	var accuracy = 1 // Seconds, ie. what to average at (60 => 1 minute averages)
	var sql = '	SELECT sensorID, UNIX_TIMESTAMP(ROUND(AVG(logged))) AS logged, ROUND(AVG(val)) AS val \
				FROM Data WHERE logged >= FROM_UNIXTIME(?) AND logged <= FROM_UNIXTIME(?) \
				GROUP BY ROUND(logged/?) \
				LIMIT 50;'
	c.query(sql, [time0, timeT, accuracy], function(err, result) {
		responder.setHeader('Content-Type', 'application/json');
		if (!err) {
			console.log("Found " + result.length + " data points between " + (new Date(time0*1000)).toLocaleString + " and "" + (new Date(timeT*1000)).toLocaleString)
			responder.send(JSON.stringify(result, null, 3));	
		}
		else  {
			console.log("Mysql error while fetching from archive: " + JSON.stringify(err))
			responder.send(JSON.stringify({}, null, 3));
		}
	});	
}

/* Saves a given value as reported by #sensorID */
function saveData(sensorID, val) {
	c.query('SELECT Count(ID) AS results FROM Sensors WHERE ID=?;', [sensorID], function(err, result) {
		if (!err && result[0]["results"]) {
			var found = !isNaN(result[0]["results"]) && parseInt(result[0]["results"]) > 0
			
			if (found) {
				var insertion = {sensorID: sensorID, val: val}
				c.query('INSERT INTO Data SET ?;', insertion, function(err, result) {
					if (!err) {
						//console.log("Saved data!")
						return true
					}
					else  {
						console.log("Mysql error: " + JSON.stringify(err))
					}
				});
			}
			else console.log("Sensor #" + sensorID + " is unknown; its data was ignored.")
		}
		else  {
			console.log("Mysql error: " + JSON.stringify(err))
		}
		return false;
	});
}

/* Registers a new sensor into the system */
function registerSensor(ID, name) {
	c.query('SELECT Count(ID) AS results FROM Sensors WHERE ID=?;', [ID], function(err, result) {
		if (!err) {
			var found = !isNaN(result[0]["results"]) && parseInt(result[0]["results"]) > 0
			
			
			if (!found) {
				var insertion = {ID: ID, type: "kinetic", name: "Test-sensor"}
				c.query('INSERT INTO Sensors SET ?;', insertion, function(err, result) {
					if (!err) {
						console.log("Registered new sensor " + ID)
					}
					else  {
						console.log("Mysql sensor insertion error: " + JSON.stringify(err))
					}
				});
			}
			else console.log("Sensor #" + ID + " already exists, please give a fresh id.")
		}
		else  {
			console.log("Mysql error: " + JSON.stringify(err))
		}
	});
}



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


