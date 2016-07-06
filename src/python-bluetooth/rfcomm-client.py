from __future__ import print_function
from bluetooth import *
import sys
from socketIO_client import SocketIO, LoggingNamespace
import json
import hashlib

socketServer = "futuwear.tunk.org"
socketPort = 13337
addr = "00:07:80:36:A6:03" # The MAC address of the device in question
deviceCode = "Rand0mSens0rSerialNumber" # This should be different for all devices



if sys.version < '3':
    input = raw_input


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
        try:
            jsonData = json.loads(jsonStuff)
            hashable = json.dumps(jsonData["sensors"], separators=(',',':')) + deviceCode
            jsonData["token"] = hashlib.md5(hashable.encode('utf-8')).hexdigest() #TODO: List access safety
            print("Hashing ", hashable)
            socket.emit('message', json.dumps(jsonData, separators=(',',':')))
        except Exception as e:
            print("ERROR", str(e))
    else:
        print("Couldn't emit due to faulty socket connection.")
	
socket.on("connect", connected)
socket.on("disonnect", disconnected)
socket.wait(seconds=1)



# Create the client socket
sock=BluetoothSocket( RFCOMM )

bluetoothProblem = True
while bluetoothProblem:
	try:
		sock.connect((addr, 1))
		bluetoothProblem = False
	except Exception as e:
		print("Device", addr, "error:", str(e))

sock.send("READY\n");


buf = "";
line_buf = [];
print("Connected via bluetooth to device", addr)
while True:
    data = sock.recv(128).decode("utf-8", errors="ignore");
    buf += data;
    line_buf = buf.split("\n");
    buf = line_buf[-1];
    #if len(data) == 0: break
    while (len(line_buf) > 1):
        #send line_buf[0] over socketIO		
        forwardToServer(line_buf[0])
        line_buf = line_buf[1:];

sock.close()
