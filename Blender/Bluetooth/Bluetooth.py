import sys
print(sys.path)


import serial
import math
import bge
from math import *
import mathutils
import time



from bluetooth import *
import json

#potikan aariarvot: 0-1023


#Global Variables

a=0.0           #Sensor reading
#aMin = 9999     #Real time calibrated min value for sensor readings
#aMax = 0        #Real time calibrated max value for sensor readings
b=0.0           #Sensor reading
#bMin = 9999     #Real time calibrated min value for sensor readings
#bMax = 0        #Real time calibrated max value for sensor readings


#USB port defining. First variable is the used port and second is baud rate (Arduino baud rate).
#Uncomment the one you use

#ser=serial.Serial('COM4',9600)              #For Windows
#ser=serial.Serial('/dev/ttyACM0',9600)     #For Linux


#Function for reading serial data.
#Needs to be enabled for one of the objects in scene (at the Logic Editor tab).
#This updates the read serial value in a global variable.

def AnaLoop():
   if(ser.inWaiting() != 0):
     global a
     global aMin
     global aMax
     global b
     global bMin
     global bMax
     line=ser.readline()
     line=line.decode("utf-8")
     try:
        osat=line.split(" ") 
        a=int(osat[0])
        b=int(osat[1])
        if a > aMax:
           aMax = a
        if a < aMin:
           aMin = a  
        if b > bMax:
           bMax = b
        if b < bMin:
           bMin = b
        print("a:{:.2f} aMin:{:.2f} aMax:{:.2f} b:{:.2f} bMin:{:.2f} bMax:{:.2f}".format(a,aMin,aMax,b,bMin,bMax))
        #time.sleep(1)
     except ValueError:
        k=9001
        print("OVER 9000")
     
        
"""        
def AnaLoop():                
     a=a+1    
     global a                    
     #print (a)
     b = b + 1
     aMin = 2
     aMax = 3
     bMin = 2
     bMax = 3
     global aMin
     global bMin
     global aMax
     global bMax
     global b 
"""
"""
def AnaLoop():                
     a=a+0.01    
     global a
     time.sleep(0.1)  
"""  
      

#Function for rotating and moving the armature bones.
#Bone names are:
"""
Back_Lower
Back_Middle
Back_Upper
Neck
L_Shoulder
L_Arm_Inner
L_Arm_Outer
R_Shoulder
R_Arm_Inner
R_Arm_Outer
"""
    
def BoneRot():
    """
    scene = bge.logic.getCurrentScene()
    # Helper vars for convenience
    source = scene.objects

    # Get the whole Armature
    main_arm = source.get('Luusto')

    main_arm.channels['Neck'].joint_rotation[30,25,0]

    main_arm.update()
    """
    """
    #a:n arvot flex-sensorin testauksella n.400-800
    global a, aMin, aMax, b, bMin, bMax
    scene = bge.logic.getCurrentScene()
    source = scene.objects
    arm = source.get('Luusto')
    
    ob = bge.logic.getCurrentController().owner
    
    a_rot = ((a-aMin)/(aMax - aMin))
    a_rot = 30
    ob.channels['Neck'].joint_rotation = mathutils.Vector([a_rot,0,0])
    ob.update()
    """
    global a
    scene = bge.logic.getCurrentScene()
    #source = scene.objects
    #arm = source.get('Armature.001')
    
    ob = bge.logic.getCurrentController().owner
    
    #a_rot = ((a-aMin)/(aMax - aMin))
    a_rot = a
    ob.channels['Bone.001'].joint_rotation = mathutils.Vector([a_rot,a_rot,a_rot])
    ob.update()
    
    
    
def LuustoRot():
    global a
    global b
    global aMax
    global aMin
    global bMax
    global bMin
    scene = bge.logic.getCurrentScene()
    source = scene.objects
    #arm = source.get('Armature')
    
    ob = bge.logic.getCurrentController().owner
    try:
        a_rot = ((a-aMin)/(aMax - aMin))
        b_rot = ((b-bMin)/(bMax - bMin))
        ob.channels['Bone.003'].joint_rotation = mathutils.Vector([b_rot,0,0])
    except ZeroDivisionError:
        a_rot = 0
        b_rot = 0
      
    #arska = scene.objects['Arnold']
    #arska.color = [0,1.0, 0, 1.0]
    
    
    """
    a_rot = a/100
    ob.channels['Bone.004'].joint_rotation = mathutils.Vector([a_rot,a_rot,a_rot])
    a_rot = b
    ob.channels['Bone.005'].joint_rotation = mathutils.Vector([a_rot,a_rot,a_rot])
    
    a_rot = a/50
    ob.channels['Bone.007'].joint_rotation = mathutils.Vector([a_rot,a_rot,a_rot])
    a_rot = b
    ob.channels['Bone.008'].joint_rotation = mathutils.Vector([a_rot,a_rot,a_rot])
    """
    
    ob.update()

#Futuwear bluetooth MAC
n = "Futuwear_data"
print("***Finding Futuwear bluetooth***")
service = find_service(name = n)
bl_socket = None

if (len(service) == 0):
    print("ERROR: Could not connect to bluetooth device!")
else:
    bl_socket = BluetoothSocket( RFCOMM )
    bl_socket.connect((service[0]["host"], service[0]["port"]))
    bl_socket.send("READY\n");
    buffer = ""
    line_buffer = []

def readBluetooth():
    global a
    global b
    global buffer
    global line_buffer
    
    if (bl_socket != None):
        buffer = buffer + bl_socket.recv(128, flags=MSG_DONTWAIT);
    lines = buffer.split('\n')
    while (len(lines) > 1):
        line_buffer.append(lines[0])
        lines = lines[1:]
    buffer = lines[0]
    
    for i in range (len(line_buffer)):
        print(line_buffer[i])
    #Read only the latest complete line
    data = json.loads(line_buffer[-1])
    for i in range(len(data['sensorData'])):
        if data['sensorData'][i]['name'] == 'ShoulderFlexZ_L':
            a = data['sensorData'][i]['value']
        if data['sensorData'][i]['name'] == 'ShoulderFlexZ_R':
            b = data['sensorData'][i]['value']
    
    line_buffer = []