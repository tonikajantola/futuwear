"""
Code currently works for one sensor measured with Arduinos analog read.
"""


import serial
import math
#import bge

#potikan aariarvot: 0-1023


#Global Variables

a=0.0           #Sensor reading
aMin = 9999     #Real time calibrated min value for sensor readings
aMax = 0        #Real time calibrated max value for sensor readings
bMin = 9999     #Real time calibrated min value for sensor readings
bMax = 0        #Real time calibrated max value for sensor readings


#USB port defining. First variable is the used port and second is baud rate (Arduino baud rate).
#Uncomment the one you use

ser=serial.Serial('COM3',9600)              #For Windows
#ser=serial.Serial('/dev/ttyACM0',9600)     #For Linux


#Function for reading serial data.
#Needs to be enabled for one of the objects in scene (at the Logic Editor tab).
#This updates the read serial value in a global variable.

while(ser.inWaiting()!=0):
     #global a, aMin, aMax
     line=ser.readline()
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
        print("a:{:.2f} aMin:{:.2f} aMax:{:.2f} b:{:.2f} bMin:{:.2f} bMax:{:.2f}".format(a,aMin,aMax,b,bMin,bMax))
     except:
        k=9001
    
       
