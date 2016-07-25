const UI_PORT = 8080	// Port to serve HTML UI on
const SOCKET_SERVER = "http://futuwear.tunk.org:13337/"; // Where to listen to Vör messages

var options = {
	analyzation: {
		riskyMuscles: ["Back_Y", "Back_X"] // Muscles that should be excercised every now and then
		
	}
}



var deviceClients = {}


// Dependencies
const http = require("http")
const fs = require("fs")
const express = require('express');
const socketIO = require('socket.io-client');
const socketServer = require('socket.io')
const mysql = require('mysql');
const crypto = require('crypto');

ioServer = socketServer.listen(8001)
ioServer.on('connection', function (socket) {
	socket.emit("id", {id: socket.id})
	nodeLog("Got connection from " + socket.id)
	
	socket.on('registration', req => {
		try {
			var j = json(req)
			var devices = j.devices
			var id = j.id
			
			for (var i = 0; i < devices.length; j++) {
				var deviceName = devices[i]
				nodeLog("Registered device(s) " + deviceName + " ("+JSON.stringify(devices)+")")
				var clientlist = deviceClients[deviceName] || []// TODO: Clean up on disconnect
				clientlist.push(id)
				deviceClients[deviceName] = clientlist
			}
			
			if (devices.length > 0) notify(devices[0], "Test message", "Hello wolrd")
			
		} catch (e) {
			
		}
	})
})


var app = express();

// Serve all static files
app.use(express.static('public'));

// Request parsers
var bodyParser = require('body-parser')
app.use(bodyParser.json());       	// to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

/* Method to get archived data with */
app.get('/fetch', function (req, res) {
	
	var content = req.query.data // TODO: Safety
	content = JSON.parse(content)
	
	getData(parseInt(content.time0), parseInt(content.timeT), req, res)
});

/* Method to get registered sensors with */
app.get('/sensors', getSensors);

/* Method to save new sensors to a device */
app.post('/manage.html', function (req, res) {
	var content = req.body
	var id = content.name + "_" + Math.round(Math.random()*1000000)
	saveSensor(id, content.name, content.device)
	res.redirect("/manage.html");	
});

app.listen(UI_PORT, function () {
	nodeLog('Serving on port ' + UI_PORT.toString());
});


///////////////////////////
// Vör socket management //
///////////////////////////

const client = socketIO.connect(SOCKET_SERVER);

client.on('connect', () => nodeLog(`Connected to Vör socket ${SOCKET_SERVER}`));
client.on('disconnect', () => nodeLog(`Client socket disconnected ${SOCKET_SERVER} :  ${new Date()}`));
client.on('reconnect_attempt', error => console.error(`Error - cannot connect to ${SOCKET_SERVER} : ${error} : ${new Date()}`));
client.on('error', error => console.error(`Error - socket connection: ${error} : ${new Date()}`));

// Listen to vör messages
client.on('message', msg => {
	
	try {
		var md5 = crypto.createHash('md5')
		
		var sensors = json(msg)["sensors"]
		var serial = "Rand0mSens0rSerialNumber" // TODO: Get from database
		
		md5.update(JSON.stringify(sensors) + serial); // TODO: SHA256
		var computedHash = md5.digest('hex')
		
		var receivedHash = json(msg)["token"]
		
		/* AES-CBC-MAC salaus+autentikointi */
		
		if (computedHash != receivedHash)
			throw new Error("Received hash " + receivedHash + " didn't match the computed hash " + computedHash)
		
		// Allow a single sensor to not be inside of list
		if (!sensors[0])
			sensors = [sensors]
			
		//nodeLog("Got vör message [" + sensors.length + " sensor(s)].")
		
		// Iterate through every sensor
		for (var i = 0; i < sensors.length; i++) {
			var sensor = sensors[i]
			
			// Iterate through every value
			for (var j = 0; j < sensor["collection"].length; j++) {
				var value = parseInt(sensor["collection"][j]["value"])
				if (isNaN(value))
					throw new Error("Sensor value was not an integer.")
				saveData(sensor["id"], value)
			}
			
		}
	} catch (e) {
		//nodeLog("Could not save vör data (" + e.message + "): " + JSON.stringify(msg))
	}
	
});

/////////////////////////
// Manage the database //
/////////////////////////

const db = require("./connection-strings")
var c;

// Wrap the database connection inside a function, so that it can be re-established on disconnect
function maintainConnection() {
	c = mysql.createConnection(db);
	
	c.connect(function(err){
		if(err){
			nodeLog('Error connecting to Db: ' + err.message);
			setTimeout(maintainConnection(), 1000) // Retry soon
			return;
		}
		nodeLog('Database connection established');
	});
	
	c.on('error', function (err) {
		nodeLog("Database error: " + err);
		if(err.code === 'PROTOCOL_CONNECTION_LOST') {
			maintainConnection(); // Reconnect
		} 
		else {         
			throw err;
		}
	})
	
}
maintainConnection();

var accuracy = 1 			// Seconds, ie. what to average at (60 => 1 minute averages)

/* Method to extract archived sensor data (JSON) */
function getData(time1, timeT, req, res) {
	var changePeriod = 1 * 60 	// Seconds
	
	var devices = getUserDevices(req)
	var time0 = Math.max(time1 - changePeriod, 0)
	
	if (!devices)
		return res && res.send(JSON.stringify({error: "No devices stored with user"}, null, 3));
	
	
	var sql = '	SELECT sensorID, name AS sensorName, UNIX_TIMESTAMP(ROUND(AVG(logged))) AS logged, ROUND(AVG(val)) AS val \
				FROM Data INNER JOIN Sensors \
				WHERE logged >= FROM_UNIXTIME(?) AND logged <= FROM_UNIXTIME(?) AND ownerKey IN (?) \
				GROUP BY ID, ROUND(logged/?) \
				ORDER BY logged DESC \
				LIMIT 43200;'
				
	c.query(sql, [time0, timeT, devices, accuracy], function(err, result) {
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

function analyzeData(ownerKey) {
	var sql = '	SELECT sensorID, name AS sensorName, STD(val) AS std, ownerKey AS device \
				FROM Data INNER JOIN Sensors \
				WHERE logged >= FROM_UNIXTIME(?) AND logged <= FROM_UNIXTIME(?) AND ownerKey IN (?) \
				GROUP BY sensorID \
				LIMIT 100;'
	var now = Math.ceil(Date.now()/1000)
	var period = 60 // Mins
	c.query(sql, [now - period * 15, now, [ownerKey], accuracy], function(err, result) {
		
		if (err)
			return nodeLog("Mysql error while analyzing from archive: " + JSON.stringify(err))
		
		
		for (var i = 0; i < result.length; i++) {
			var sensor = result[i]
			notify(sensor.device, "You've been still for a while now", sensor.sensorName + " needs a shake, because it's standard deviation is " + sensor.std)
		}		
	});	
}

/* Saves a given value as reported by #sensorID */
function saveData(sensorID, val, failCallback) {
	c.query('SELECT DISTINCT ownerKey FROM Sensors WHERE ID=?;', [sensorID], function(err, result) {
		try {
			var sensorExists = result.length > 0
			if (!sensorExists)
				throw new Error("Sensor #" + sensorID + " has not been registered.");
			var insertion = {sensorID: sensorID, val: val} // Information to INSERT INTO the "Data" table
			
			analyzeData(result[0].ownerKey)
			
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
function saveSensor(ID, name, device) {
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

/* Method to get a list of owned/viewed sensors*/
function getSensors(req, res) {
	var devices = getUserDevices(req)
	
	if (!devices)
		return res.send(JSON.stringify({error: "No devices were found."}, null, 3));
	
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


/////////////////////////////
// Server helper functions //
/////////////////////////////


/* Method to force data into JSON object */
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

/* Server logging*/
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

/* Method to parse user's devices from cookie */
function getUserDevices(req) {
	var cookies = parseCookies(req);
	if (typeof cookies.devices == "undefined")
		return false
	var devices = cookies.devices.split(",")
	return devices
}


function analyze() {
	
}

function notify(device, title, message) {
	var clients = deviceClients[device] || []
	clients.forEach(function (elem, i, arr) {
		ioServer.socket(elem).emit(device, {title: title, message: message})
	})
}


