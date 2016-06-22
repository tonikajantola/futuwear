import serial
import math
import bge
from math import *
import mathutils
import time

#potikan aariarvot: 0-1023


#Global Variables

a=0.0           #Sensor reading
aMin = 9999     #Real time calibrated min value for sensor readings
aMax = 0        #Real time calibrated max value for sensor readings
b=0.0           #Sensor reading
bMin = 9999     #Real time calibrated min value for sensor readings
bMax = 0        #Real time calibrated max value for sensor readings


#USB port defining. First variable is the used port and second is baud rate (Arduino baud rate).
#Uncomment the one you use

#ser=serial.Serial('COM4',9600)              #For Windows
#ser=serial.Serial('/dev/ttyACM0',9600)     #For Linux


#Function for reading serial data.
#Needs to be enabled for one of the objects in scene (at the Logic Editor tab).
#This updates the read serial value in a global variable.
"""
def AnaLoop():
   while(1==1):
     global a, aMin, aMax, b, bMin, bMax
     line=ser.readline()
     line=line.decode("utf-8")
     try:
        osat=line.split(" ") 
        a=float(osat[0])
        b=float(osat[1])
        if a > aMax:
           aMax = a
        if a < aMin:
           aMin = a  
        if b > bMax:
           bMax = b
        if b < bMin:
           bMin = b
        #print("a:{:.2f} aMin:{:.2f} aMax:{:.2f} b:{:.2f} bMin:{:.2f} bMax:{:.2f}".format(a,aMin,aMax,b,bMin,bMax))
        time.sleep(0.1)
     except:
        k=9001
        print("OVER 9000")
"""       
        
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

def AnaLoop():                
     a=a+1    
     global a
     time.sleep(0.1)  
     
"""
#Simple test script for rotating an object.
def Cube():
    global a
    scene = bge.logic.getCurrentScene()     #Locate current device
    cont = bge.logic.getCurrentController()
    own = cont.owner   
 
    xyz = own.localOrientation.to_euler()   #Extract the Rotation Data    
    a = 2
    xyz[0] = math.radians(a)                #PreLoad your RX data
                                            #xyz[0] x Rotation axis
                                            #xyz[1] y Rotation axis
                                            #xyz[2] z Rotation axis
    own.localOrientation = xyz.to_matrix()  #Apply your rotation data
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
    source = scene.objects
    arm = source.get('Armature.001')
    
    ob = bge.logic.getCurrentController().owner
    
    #a_rot = ((a-aMin)/(aMax - aMin))
    a_rot = a
    ob.channels['Bone.001'].joint_rotation = mathutils.Vector([a_rot,a_rot,a_rot])
    ob.update()
    