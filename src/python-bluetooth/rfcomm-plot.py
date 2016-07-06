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
    data = sock.recv(128).decode("utf-8", errors="ignore");
    buf += data;
    print(data, end="");
    line_buf = buf.split("\n");
    buf = line_buf[-1];
    changed = False
    while (len(line_buf) > 1):
        try:
            js = json.loads(line_buf[0]);
            for sensor in js["sensors"]:
                s_name  = sensor["name"]
                s_value = sensor["collection"][0]["value"]
                if not s_name in ydata:
                    ydata[s_name] = [0]*hist_len
                    lines[s_name], = plt.plot(ydata[s_name], label=s_name)
                    plt.legend(lines, list(lines.keys()))
                update_line(s_name, s_value)
            changed = True
        except Exception as e:
            print("ERROR: " + str(e));
        line_buf = line_buf[1:];
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
