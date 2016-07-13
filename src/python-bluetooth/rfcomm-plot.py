# file: rfcomm-client.py
# auth: Albert Huang <albert@csail.mit.edu>
# desc: simple demonstration of a client application that uses RFCOMM sockets
#       intended for use with rfcomm-server
#
# $Id: rfcomm-client.py 424 2006-08-24 03:35:54Z albert $

from __future__ import print_function
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

lastDraw = time.time()
running = True
while running:
    try:
        bt.readData()
        changed = False
        while (bt.dataAvailable()):
            try:
                js = json.loads(bt.nextLine());
                for sensor in js["sensors"]:
                    s_name  = sensor["name"]
                    s_value = sensor["collection"][0]["value"]
                    if not s_name in ydata:
                        ydata[s_name] = [0]*hist_len
                        lines[s_name], = plt.plot(ydata[s_name], label=s_name)
                        plt.legend()
                    update_line(s_name, s_value)
                changed = True
            except Exception as e:
                print("ERROR: " + str(e));
        if changed:
            for sensor in ydata:
                lines[sensor].set_xdata(numpy.arange(hist_len))
                lines[sensor].set_ydata(ydata[sensor])
            if (time.time() - lastDraw) > 0.01:
                plt.draw()
                lastDraw = time.time()
        #sock.send(data)
    except KeyboardInterrupt:
        running = False

print("Shutting down")
bt.finish()
