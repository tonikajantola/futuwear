# file: rfcomm-client.py
# auth: Albert Huang <albert@csail.mit.edu>
# desc: simple demonstration of a client application that uses RFCOMM sockets
#       intended for use with rfcomm-server
#
# $Id: rfcomm-client.py 424 2006-08-24 03:35:54Z albert $

from __future__ import print_function
from bluetooth import *
import sys
from socketIO_client import SocketIO, LoggingNamespace
import json
import hashlib

socketServer = "futuwear.tunk.org"
socketPort = 13337
deviceCode = "Rand0mSens0rSerialNumber" # This should be different for all devices

if sys.version < '3':
    input = raw_input

#stdscr = curses.initscr();

connection = False

def connected(*args):
    global connection
    print("Connected to web socket at", socketServer)
    connection = True

def disconnected(*args):
    global connection
    print("Connection to web socket was interrupted!")
    connection = False
	
socket = SocketIO(socketServer, socketPort, LoggingNamespace)

def forwardToServer(jsonStuff):
    global socketIO
    global connection
    if connection:
	    jsonData = json.loads(jsonStuff)
		jsonData["token"] = hashlib.md5(deviceCode + jsonData["sensors"].dumps()).hexdigest() #TODO: Safety
        print("Emitting ", json.dumps(jsonData))
        socket.emit('message', json.dumps(jsonData))
    else:
        print("Couldn't emit due to faulty socket connection.")
	
socket.on("connect", connected)
socket.on("disonnect", disconnected)
socket.wait(seconds=1)


addr = "00:07:80:36:A6:03"
"""
if len(sys.argv) < 2:
    print("no device specified.  Searching all nearby bluetooth devices for")
    print("the SampleServer service")
else:
    addr = sys.argv[1]
    print("Searching for SampleServer on %s" % addr)

# search for the SampleServer service
uuid = None
service_matches = find_service( address = addr, uuid = None )#uuid = uuid, address = addr )

if len(service_matches) == 0:
    print("couldn't find the SampleServer service =(")
    sys.exit(0)

first_match = service_matches[0]
port = first_match["port"]
name = first_match["name"]
host = first_match["host"]

print("connecting to \"%s\" on %s, port %s" % (name, host, port))
"""
# Create the client socket
sock=BluetoothSocket( RFCOMM )

bluetoothProblem = True
while bluetoothProblem:
	try:
		sock.connect((addr, 1))
		bluetoothProblem = False
	except:
		print("Device", addr, "could not be reached. Try resetting?")

sock.send("READY\n");


buf = "";
line_buf = [];
print("Connected via bluetooth to device", addr)
while True:
    data = sock.recv(128).decode("utf-8");
    buf += data;
    line_buf = buf.split("\n");
    buf = line_buf[-1];
    #if len(data) == 0: break
    while (len(line_buf) > 1):
        #send line_buf[0] over socketIO		
        forwardToServer(line_buf[0])
        line_buf = line_buf[1:];

sock.close()
