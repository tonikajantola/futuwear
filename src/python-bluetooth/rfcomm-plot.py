# file: rfcomm-client.py
# auth: Albert Huang <albert@csail.mit.edu>
# desc: simple demonstration of a client application that uses RFCOMM sockets
#       intended for use with rfcomm-server
#
# $Id: rfcomm-client.py 424 2006-08-24 03:35:54Z albert $

from __future__ import print_function
from cycler import cycler
#import curses
from bluetooth import *
import sys
import json

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

addr = "00:07:80:36:A6:03"
def update_line(sensor, data):
    global ydata
    global lines
    ydata[sensor].append(data)
    ydata[sensor] = ydata[sensor][1:]

# Create the client socket
sock=BluetoothSocket( RFCOMM )
#sock.connect((host, port))
sock.connect((addr, 1))

sock.send("READY\n");
buf = "";
line_buf = [];
print("connected.")
lastDraw = time.time()
while True:
    data = sock.recv(128).decode("utf-8");
    buf += data;
    print(data, end="");
    line_buf = buf.split("\n");
    buf = line_buf[-1];
    changed = False
    while (len(line_buf) > 1):
        js = json.loads(line_buf[0]);
        for sensor in js["sensorData"]:
            if not sensor in ydata:
                ydata[sensor] = [0]*hist_len
                lines[sensor], = plt.plot(ydata[sensor])
            update_line(sensor, js["sensorData"][sensor])
        line_buf = line_buf[1:];
        changed = True
    if len(data) == 0: break
    if changed:
        for sensor in ydata:
            lines[sensor].set_xdata(numpy.arange(hist_len))
            lines[sensor].set_ydata(ydata[sensor])
        if (time.time() - lastDraw) > 0.01:
            plt.draw()
            lastDraw = time.time()
    #sock.send(data)

sock.close()
