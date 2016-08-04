#from __future__ import print_function
from cycler import cycler
#import curses
import sys
import json

import bluetooth_handler as bt

import matplotlib.pyplot as plt
import numpy
import time

plt.ion()
#plt.rc('axes', prop_cycle=(cycler('color', ['r', 'g', 'b', 'y', 'c', 'm', 'k'])))

hist_len = 100

ydata = {}
lines = {}

#lines[0], = plt.plot(ydata[0], 'b')
#lines[1], = plt.plot(ydata[1], 'r')

plt.ylim([0, 1200])

def update_line(sensor, data):
    global ydata
    global lines
    ydata[sensor].append(data)
    ydata[sensor] = ydata[sensor][1:]
bt.init()

#plt.show()

plt.show()
lastDraw = time.time()
running = True
while running:
    try:
        bt.readData()
        changed = False
        while (bt.dataAvailable()):
            try:
                js = json.loads(bt.nextLine());
                if "sensorData" in js:
                    s_name  = js["sensorData"]["name"]
                    #print(s_name)
                    s_value = js["sensorData"]["value"]
                    #print(s_value)
                    if not s_name in ydata:
                        print('added new line')
                        ydata[s_name] = [0]*hist_len
                        lines[s_name], = plt.plot(ydata[s_name], label=s_name)
                        plt.legend()
                    update_line(s_name, s_value)
                    changed = True
            except Exception as e:
                print("ERROR: " + str(e));
        if changed:
            pass
            #print('updated data')
            #print("")
        if (time.time() - lastDraw) > 0.001:
            #print('updated plot')
            for sensor in ydata:
                lines[sensor].set_xdata(numpy.arange(hist_len))
                lines[sensor].set_ydata(ydata[sensor])
                try:
                    print("{0}: {1:04d}, \t".format(sensor, ydata[sensor][-1]), end='')
                except Exception as e:
                    pass#print("ERROR: " + str(e))
            print("")
            plt.draw()
            #plt.show()
            plt.pause(0.0001)
            lastDraw = time.time()
        #sock.send(data)
    except KeyboardInterrupt:
        running = False

print("Shutting down")
bt.finish()
