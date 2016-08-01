const UI_PORT = 8080	 // Port to serve HTML UI on
const NOTIFY_PORT = 8001 // Port to serve notification socket on
const SOCKET_SERVER = "http://futuwear.tunk.org:13337/"; // Where to listen to Vör messages

const options = {
	analyzation: {
		riskyMuscles: ["Back_Y", "Back_X"], // Muscles that should be excercised every now and then
		period: 60 //Seconds
	}
}

// Remember when a device has gone through its last analysis
var analysisTimestamps = {} // {"devicename": new Date()}

// Remember which socket clients want notifications for which devices
var deviceClients = {} // {"devicename": ["socketid1", "socketid2"]}


// Dependencies
const http = require("http")
const fs = require("fs")
const express = require('express');
const socketIO = require('socket.io-client');
const socketServer = require('socket.io')
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

/* Method to get archived sensor data with */
app.get('/fetch', function (req, res) {
	var content = req.query.data // TODO: Safety
	content = JSON.parse(content)
	getData(parseInt(content.time0), parseInt(content.timeT), req, res)
});

/* Method to register a new sensor with */
app.get('/register', function (req, res) {
		
	try {
		var jsonData = json(req.body)
		
		var uuid = jsonData.uuid
		var pin = jsonData.pin
		var name = jsonData.name
		
		if (!uuid || !pin || !name)
			throw new Error("A required field was missing")
		
		var insertion = {UUID: uuid, pin: pin, name: name}
		
		c.query('INSERT INTO Devices SET ?;', insertion, function (err, result) {
			res.setHeader('Content-Type', 'application/json');
			if (err) {
				nodeLog("Mysql error: " + JSON.stringify(err));
				res.send(JSON.stringify({error: "A sensor with that name/uuid combo could not be added."}, null, 3));
			}
			else {
				nodeLog("Saved new device " + name)
				res.send(JSON.stringify({error: false}, null, 3));
			}
		});
		
	} catch (e) {
		nodeLog("Could not register sensor: " + e)
		res.send(JSON.stringify({error: JSON.stringify(e)}, null, 3));
	}
});

/* Method to get a list of registered sensors with */
app.get('/sensors', getSensors);


app.listen(UI_PORT, function () {
	nodeLog('Serving on port ' + UI_PORT.toString());
});


////////////////////////////////////
// Notification socket management //
////////////////////////////////////

var ioServer = socketServer.listen(NOTIFY_PORT)

ioServer.on('connection', function (socket) {
	socket.emit("id", {id: socket.id}) // Give the user their socket ID
	
	// Wait for user to respond with a list of their devices
	socket.on('registration', req => {
		try {
			var j = json(req)
			var devices = j.devices
			var id = j.id
			
			for (var i = 0; i < devices.length; i++) {
				var deviceName = devices[i]
				
				var clientlist = deviceClients[deviceName] || []// TODO: Clean up on disconnect
				if (clientlist.indexOf(id) < 0)
					clientlist.push(id) // Channel notifications to this socket
				
				deviceClients[deviceName] = clientlist
			}
			
			if (devices.length > 0) notify(devices[0], "Hello world!", "The notification system is connected. /" + new Date())
			
		} catch (e) {
			
		}
	})
})

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
		var payload = json(msg)
		var uuid = payload.uuid
		
		if (!uuid)
			throw new Error("Field 'uuid' was missing from request.")

		c.query('SELECT DISTINCT pin, name FROM Devices WHERE UUID=?;', [uuid], function(err, result) {
			try {
				if (err)
					throw new Error("Could not load name/pin for device " + uuid);
				
				var pin = result[0].pin // This will fail if UUID not found
				var name = result[0].name // This will fail if UUID not found
				if (!pin)
					throw new Error("Pin code did not match");
				
				var md5 = crypto.createHash('md5')
				var sensors = payload.sensors
				
				// Hash the sensor payload 
				md5.update(JSON.stringify(sensors) + uuid + pin); // TODO: Consider SHA256?
				var computedHash = md5.digest('hex')
				var receivedHash = payload.token
				
				if (computedHash != receivedHash)
					throw new Error("Received hash " + receivedHash + " didn't match the computed hash " + computedHash)
				
				/* Clients know their names, now give them their UUIDs
				   so that they know which vör messages concern them */
				   
			   /*
				var clients = deviceClients[name] || []
				clients.forEach(function (elem, i, arr) {
					nodeLog("Sending to " + elem)
					ioServer.to(elem).emit("uuid-confirm", {name: name, uuid: uuid})
				})
				*/
				
				if (!sensors[0]) sensors = [sensors] // Allow a single sensor to not be inside of list
				
				// Iterate every sensor
				for (var i = 0; i < sensors.length; i++) {
					var sensor = sensors[i]
					
					// Iterate every value
					for (var j = 0; j < sensor.collection.length; j++) {
						var value = parseInt(sensor.collection[j]["value"])
						if (isNaN(value))
							throw new Error("Sensor value was not an integer.")
						
						// Save the validated data point to our database
						saveData(name, sensor.name, value)
					}
				}
			} catch (e) {
				nodeLog("Could not save data: " + e.message)
			}
		});		
	} catch (e) {
		nodeLog("Could not save vör data: " + e.message)
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
				ON Sensors.ID=Data.sensorID \
				WHERE logged >= FROM_UNIXTIME(?) AND logged <= FROM_UNIXTIME(?) AND ownerKey IN (?) \
				GROUP BY ID, ROUND(logged/?) \
				ORDER BY logged DESC \
				LIMIT 43200;'
				
	var q = c.query(sql, [time0, timeT, devices, accuracy], function(err, result) {
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

/* Method to analyze posture variation over time*/
function analyzeData(ownerKey) {
		
	var tooSoon = !analysisTimestamps[ownerKey] || (new Date() - analysisTimestamps[ownerKey]) < options.analyzation.period * 1000 // Only run this every options.analyzation.period seconds, because it's an intensive process
	
	if (tooSoon)
		return analysisTimestamps[ownerKey] = analysisTimestamps[ownerKey] || new Date()
	
	var sql = '	SELECT sensorID, name AS sensorName, STD(val) AS std, ownerKey AS device \
				FROM Data INNER JOIN Sensors \
				ON Sensors.ID=Data.sensorID \
				WHERE logged >= FROM_UNIXTIME(?) AND logged <= FROM_UNIXTIME(?) AND ownerKey IN (?) \
				GROUP BY sensorID \
				LIMIT 100;'
				
	var now = Math.ceil(Date.now()/1000)
	var period = 60 // Mins 
	
	analysisTimestamps[ownerKey] = new Date()
	
	var analysis = c.query(sql, [now - period * 60, now, [ownerKey], accuracy], function(err, result) {
				
		if (err)
			return nodeLog("Mysql error while analyzing from archive: " + JSON.stringify(err))
		
		// Read results for every sensor
		for (var i = 0; i < result.length; i++) {
			var sensor = result[i]
			
			if (options.analyzation.riskyMuscles.indexOf(sensor.sensorName) < 0) 
				continue
			
			notify(sensor.device, "You've been still for a while now", sensor.sensorName + " needs a shake, because it's standard deviation is " +sensor.std) // FIXME: Only fire when relevant
		}		
	});
}

/* Saves a given value as reported by #sensorID */
function saveData(deviceName, sensorName, val, failCallback) {
	
	// First make sure that the sensor exists
	c.query('SELECT DISTINCT ID FROM Sensors WHERE name=? AND ownerKey=?;', [sensorName, deviceName], function(err, result) {
		try {
			var sensorExists = result.length > 0
			if (!sensorExists) {
				var id = sensorName + "_" + Math.round(Math.random()*1000000)
				saveSensor(id, sensorName, deviceName) // Register the sensor
				
				throw new Error("Sensor " + sensorName + " for device " + deviceName + " had not been registered.");
			}
			
			var sensorID = result[0].ID
			var insertion = {sensorID: sensorID, val: val} // Information to INSERT INTO the "Data" table
			
			analyzeData(deviceName)
			
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
	
	// First make sure that the sensor doesn't alreadyexist
	c.query('SELECT Count(ID) AS results FROM Sensors WHERE ID=?;', [ID], function(err, result) {
		if (!err) {
			var found = !isNaN(result[0]["results"]) && parseInt(result[0]["results"]) > 0
						
			if (!found) {
				var insertion = {ID: ID, name: name, ownerKey: device}
				var q = c.query('INSERT INTO Sensors SET ?;', insertion, function(err, result) {
					if (!err)
						nodeLog("Registered new sensor " + ID + " with device " + device)
					else
						nodeLog("Mysql sensor insertion error: " + JSON.stringify(err))
				})
			}
			else nodeLog("Sensor #" + ID + " already exists, could not add it.")
		}
		else {
			nodeLog("Mysql error: " + JSON.stringify(err))
		}
	})
}

/* Method to get a list of owned/viewed sensors based on cookies */
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
				
	var q = c.query(sql, [devices], function(err, result) {
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

/* Server logging */
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
function parseCookies(request) {
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

function notify(device, title, message) {
	console.log("Notifying " + device + ": " + message)
	var clients = deviceClients[device] || []
	clients.forEach(function (elem, i, arr) {
		ioServer.to(elem).emit(device, {title: title, message: message})
	})
}


