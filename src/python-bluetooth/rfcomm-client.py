from __future__ import print_function
import bluetooth_handler as bt
import sys
from socketIO_client import SocketIO, LoggingNamespace
import json
import hashlib

socketServer = "futuwear.tunk.org"
socketPort = 13337
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

bt.init()

buf = "";
line_buf = [];

running = True
while running:
    try:
        bt.readData()
        while bt.dataAvailable():
            #send line_buf[0] over socketIO		
            forwardToServer(bt.nextLine())
    except KeyboardInterrupt:
        running = False
print("Shutting down")
bt.finish()
