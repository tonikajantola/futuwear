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

/* Method to get archived data with */
app.get('/fetch', function (req, res) {
	
	var content = req.query.data // TODO: Safety
		
	//nodeLog("Got fetched: " + content)
	content = JSON.parse(content)
	
	getData(parseInt(content.time0), parseInt(content.timeT), res)
});

/* Method to get registered sensors with */
app.get('/sensors', getSensors);

function getUserDevices(req) {
	
	var cookies = parseCookies(req);
	if (typeof cookies.devices == "undefined")
		return false
	var devices = cookies.devices.split(",")
	return devices
}


app.post('/manage.html', function (req, res) {
	var content = req.body
	var id = content.name + "_" + Math.round(Math.random()*1000000)
	registerSensor(id, content.name, content.device)
	res.redirect("/manage.html");	
});


app.listen(UI_PORT, function () {
	nodeLog('Serving on port ' + UI_PORT.toString());
});

var lastMessage = {}


///////////////////////////
// Connect to Vör socket //
///////////////////////////


const client = socketIO.connect(SOCKET_SERVER);
client.on('connect', () => nodeLog(`Connected to Vör socket ${SOCKET_SERVER}`));
client.on('disconnect', () => nodeLog(`Client socket disconnected ${SOCKET_SERVER} :  ${new Date()}`));
client.on('reconnect_attempt', error => console.error(`Error - cannot connect to ${SOCKET_SERVER} : ${error} : ${new Date()}`));
client.on('error', error => console.error(`Error - socket connection: ${error} : ${new Date()}`));

client.on('message', msg => {
	
	var sensors = json(msg)["sensors"]
	
	try {
		var hashPie = JSON.stringify(sensors)
		var md5 = crypto.createHash('md5')
		var serial = "Rand0mSens0rSerialNumber" // TODO: Get from database
		md5.update(hashPie + serial); // TODO: SHA256
		var computedHash = md5.digest('hex')
		var receivedHash = json(msg)["token"]
		
		/* AES-CBC-MAC salaus+autentikointi*/
		
		if (computedHash != receivedHash)
			throw new Error("Received hash " + receivedHash + " didn't match the computed hash " + computedHash)
		
		if (!sensors[0]) {
			sensors = [sensors]
		}
		nodeLog("Got a vör message with readings from " + sensors.length + " sensor(s).")
		for (var i = 0; i < sensors.length; i++) {
			var sensor = sensors[i]
			
			for (var j = 0; j < sensor["collection"].length; j++) {
				var value = parseInt(sensor["collection"][j]["value"])
				saveData(sensor["id"], value)
					
			}
		}
	} catch (e) {
		nodeLog("Could not save vör data (" + e.message + "): " + JSON.stringify(msg))
	}
	
});

/////////////////////////
// Manage the database //
/////////////////////////

const db = require("./connection-strings")

var c;

function maintainConnection() {
	c = mysql.createConnection(db);
	
	c.connect(function(err){
		if(err){
			nodeLog('Error connecting to Db: ' + err.message);
			setTimeout(maintainConnection(), 1000)
			return;
		}
		nodeLog('Database connection established');
	});
	
	c.on('error', function (err) {
		nodeLog("Database error: " + err);
		if(err.code === 'PROTOCOL_CONNECTION_LOST') {
			maintainConnection();
		} else {         
			throw err;
		}
	})
	
}
maintainConnection();


function getData(time0, timeT, res) {
	var accuracy = 1 // Seconds, ie. what to average at (60 => 1 minute averages)
	
	
	
	var sql = '	SELECT sensorID, UNIX_TIMESTAMP(ROUND(AVG(logged))) AS logged, ROUND(AVG(val)) AS val \
				FROM Data WHERE logged >= FROM_UNIXTIME(?) AND logged <= FROM_UNIXTIME(?) \
				GROUP BY ROUND(logged/?) \
				ORDER BY logged DESC \
				LIMIT 50;'
				
	c.query(sql, [time0, timeT, accuracy], function(err, result) {
		res.setHeader('Content-Type', 'application/json');
		
		if (!err) {
			nodeLog("Found " + result.length + " data points between " + (new Date(time0*1000)).toLocaleString() + " and " + (new Date(timeT*1000)).toLocaleString())
			res.send(JSON.stringify(result, null, 3));	
		}
		else  {
			nodeLog("Mysql error while fetching from archive: " + JSON.stringify(err))
			res.send(JSON.stringify({}, null, 3));
		}
	});	
}

/* Saves a given value as reported by #sensorID */
function saveData(sensorID, val, failCallback) {
	c.query('SELECT Count(ID) AS matchedSensors FROM Sensors WHERE ID=?;', [sensorID], function(err, result) {
		try {
			var sensorExists = parseInt(result[0]['matchedSensors']) > 0
			if (!sensorExists)
				throw new Error("Sensor #" + sensorID + " has not been registered.");
			var insertion = {sensorID: sensorID, val: val} // Information to INSERT INTO the "Data" table
			
			c.query('INSERT INTO Data SET ?;', insertion, function(err, result) {
				if (err)
					nodeLog("Mysql error: " + JSON.stringify(err));
			});
		} catch (e) {
			nodeLog("Data save error: " + e.message)
			if (typeof failCallback == "function")
				return failCallback()
		}
	});
}

/* Registers a new sensor into the system */
function registerSensor(ID, name, device) {
	c.query('SELECT Count(ID) AS results FROM Sensors WHERE ID=?;', [ID], function(err, result) {
		if (!err) {
			var found = !isNaN(result[0]["results"]) && parseInt(result[0]["results"]) > 0
			
			
			if (!found) {
				var insertion = {ID: ID, type: "kinetic", name: name, ownerKey: device}
				c.query('INSERT INTO Sensors SET ?;', insertion, function(err, result) {
					if (!err) {
						nodeLog("Registered new sensor " + ID + " with device " + device)
					}
					else  {
						nodeLog("Mysql sensor insertion error: " + JSON.stringify(err))
					}
				});
			}
			else nodeLog("Sensor #" + ID + " already exists, please give a fresh id.")
		}
		else {
			nodeLog("Mysql error: " + JSON.stringify(err))
		}
	});
}


function getSensors(req, res) {
	var devices = getUserDevices(req)
	
	if (!devices)
		return res.send(JSON.stringify({error: "No devices were found."}, null, 3));
	
	var whereClauses = ""
	for (var i; i)
	
	var sql = '	SELECT ID, name, ownerKey, COUNT(ID) - 1 AS collection \
				FROM Sensors \
				LEFT JOIN Data ON Sensors.ID=Data.sensorID \
				WHERE ownerKey IN (?) \
				GROUP BY Sensors.ID \
				ORDER BY ownerKey \
				LIMIT 100;'
				
	c.query(sql, [devices], function(err, result) {
		res.setHeader('Content-Type', 'application/json');
		
		if (!err) {			
			res.send(JSON.stringify(result, null, 3));	
		}
		else  {
			nodeLog("Mysql error while getting sensors: " + JSON.stringify(err))
			res.send(JSON.stringify({error: JSON.stringify(err)}, null, 3));
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
		nodeLog("JSON data is faulty, calling it {}")
		return {}
	}
}

function nodeLog(str) {
	var currentTime = new Date()
	var clock = [currentTime.getHours(), currentTime.getMinutes(), currentTime.getSeconds()]
	clock = clock.map(function (digit) {
        if (digit.toString().length == 1)
            return "0" + digit;
		else return digit
	})
	console.log(clock.join(':') + ' ' + str)
}

/* From http://stackoverflow.com/a/3409200 */
function parseCookies (request) {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}


