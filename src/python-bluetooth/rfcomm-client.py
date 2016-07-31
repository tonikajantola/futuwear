'''
Futuwear python client

The client's role is to connect to the Futuwear 


'''

from __future__ import print_function
import bluetooth_handler as bt
import sys
from socketIO_client import SocketIO, LoggingNamespace
import json
import hashlib

socketServer = "futuwear.tunk.org"
socketPort = 13337

if sys.version < '3':
    input = raw_input

device_uuid = ""
device_pin  = ""
device_name = ""


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

def forwardToServer(inData):
    global socketIO
    global connection
    if connection:
        try: 
            s_name = inData["sensorData"]["name"]
            s_value = inData["sensorData"]["value"]
            s_id = ""
            if s_name == "L_Shoulder_Y_Rot":
                s_id = "L_Shoulder_Y_Rot_725627"
            elif s_name == "R_Shoulder_Y_Rot":
                s_id = "R_Shoulder_Y_Rot_985566"
            elif s_name == "L_Shoulder_X_Rot":
                s_id = "L_Shoulder_X_Rot_524467"
            elif s_name == "R_Shoulder_X_Rot":
                s_id = "R_Shoulder_X_Rot_30064"
            elif s_name == "Back_X":
                s_id = "Back_X_123825"
            elif s_name == "Back_Y":
                s_id = "Back_Y_445885"
            jsonData = {'sensors': [{"id":s_id, "name": s_name, "description": "None", "collection" : [{"value": s_value, "timestamp": 0}]}]}

            jsonData['uuid'] = device_uuid
            hashable = json.dumps(jsonData["sensors"], separators=(',',':')) + device_uuid + device_pin
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
bt.sendData('{"request":"configuration"}\n')


config_received = False

running = True
while running:
    try:
        bt.readData()
        while bt.dataAvailable():
            #send line_buf[0] over socketIO	
            inData = json.loads(bt.nextLine())
            if "configuration" in inData:
                print("Fetched configuration from device")
                config_received = True
                conf = inData["configuration"]
                if "uuid" in conf:
                    device_uuid = conf["uuid"]
                    print("UUID: " + device_uuid)
                if "pin" in conf:
                    device_pin = conf["pin"]
                    print("PIN (watch your back!): " + device_pin)
                if "name" in conf:
                    device_name = conf["name"]
                    print("Name: " + device_name)
                
            if config_received and "sensorData" in inData:
                forwardToServer(inData)
    except KeyboardInterrupt:
        running = False
print("Shutting down")
bt.finish()
