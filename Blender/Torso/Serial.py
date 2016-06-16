"""
Code currently works for one sensor measured with Arduinos analog read.
"""


import serial
import math
import bge
from math import *
import mathutils

#potikan aariarvot: 0-1023


#Global Variables

a=0.0           #Sensor reading
aMin = 9999     #Real time calibrated min value for sensor readings
aMax = 0        #Real time calibrated max value for sensor readings


#USB port defining. First variable is the used port and second is baud rate (Arduino baud rate).
#Uncomment the one you use

ser=serial.Serial('COM3',9600)              #For Windows
#ser=serial.Serial('/dev/ttyACM0',9600)     #For Linux


#Function for reading serial data.
#Needs to be enabled for one of the objects in scene (at the Logic Editor tab).
#This updates the read serial value in a global variable.

def AnaLoop():
     while(ser.inWaiting()!=0):
         global a, aMin, aMax
         line=ser.readline()
         try:
            a=float(line)
         except ValueError:
            k = 42
         if a > aMax:
             aMax = a
         if a < aMin:
             aMin = a
         #print("a:{:.2f} aMin:{:.2f} aMax:{:.2f}".format(a,aMin,aMax))
       
        
        
#Simple test script for rotating an object.
def Cube():
    global a
    scene = bge.logic.getCurrentScene()     #Locate current device
    cont = bge.logic.getCurrentController()
    own = cont.owner   
 
    xyz = own.localOrientation.to_euler()   #Extract the Rotation Data    
    xyz[0] = math.radians(a)                #PreLoad your RX data
                                            #xyz[0] x Rotation axis
                                            #xyz[1] y Rotation axis
                                            #xyz[2] z Rotation axis
    own.localOrientation = xyz.to_matrix()  #Apply your rotation data
    
    
    

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
    
def Luusto():
    #a:n arvot flex-sensorin testauksella n.400-800
    global a, aMin, aMax
    scene = bge.logic.getCurrentScene()
    source = scene.objects
    arm = source.get('Luusto')
    
    ob = bge.logic.getCurrentController().owner
    
    b = -((a-aMin)/(aMax - aMin))
    ob.channels['Bone.001'].joint_rotation = mathutils.Vector([0,0,b])
    ob.update()
    
    
#Non-working function for changing and objects color.
def Cylinder():
    global a, aMin, aMax
    scene = bge.logic.getCurrentScene()
    source = scene.objects
    
    ob = bge.logic.getCurrentController().owner
    
    b = ((a-aMin)/(aMax - aMin))
    color = b/aMax
    obj.color = [ 0, 0.0, 0.0, color]
    ob.update()
    