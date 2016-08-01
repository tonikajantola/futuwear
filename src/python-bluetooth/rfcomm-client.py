'''
Futuwear python client

The client's role is to connect to the Futuwear 


'''

from __future__ import print_function
import bluetooth_handler as bt
import sys
from socketIO_client import SocketIO, LoggingNamespace
import json, requests
import hashlib

socketServer = "futuwear.tunk.org"
registerUrl = 'http://futuwear.tunk.org/register/'
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
    
def registerSensor(name, uuid, pin):
    global registerUrl
    payload = {"name": name, "uuid": uuid, "pin": pin}
    resp = requests.get(registerUrl, data=payload)
    data = json.loads(resp.text)
    status = data['error']
    if not status:
        status = "Registration successful"
    return status
    
socket = SocketIO(socketServer, socketPort, LoggingNamespace)

def forwardToServer(inData):
    global socketIO
    global connection
    if connection:
        try: 
            s_name = inData["sensorData"]["name"]
            s_value = inData["sensorData"]["value"]
            
            jsonData = {'sensors': [{"name": s_name, "description": "None", "collection" : [{"value": s_value, "timestamp": 0}]}]}

            jsonData['uuid'] = device_uuid
            hashable = json.dumps(jsonData["sensors"], separators=(',',':')) + device_uuid + device_pin
            jsonData["token"] = hashlib.md5(hashable.encode('utf-8')).hexdigest() #TODO: List access safety
            socket.emit('message', json.dumps(jsonData, separators=(',',':')))
            print("Forwarded hashed data from sensor ", s_name)
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
            try:
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
                    
                    #print(registerSensor(device_name, device_uuid, device_pin))
                    
                if config_received and "sensorData" in inData:
                    forwardToServer(inData)
            except json.decoder.JSONDecodeError:
                print("Got faulty JSON data")
    except KeyboardInterrupt:
        running = False
print("Shutting down")
bt.finish()
