# file: rfcomm-client.py
# auth: Albert Huang <albert@csail.mit.edu>
# desc: simple demonstration of a client application that uses RFCOMM sockets
#       intended for use with rfcomm-server
#
# $Id: rfcomm-client.py 424 2006-08-24 03:35:54Z albert $

from __future__ import print_function
#import curses
from bluetooth import *
import sys
import json

import matplotlib.pyplot as plt
import numpy
import time

plt.ion()
ydata = []
ydata.append([0]*100)
ydata.append([0]*100)

lines = [0, 0]
lines[0], = plt.plot(ydata[0], 'b')
lines[1], = plt.plot(ydata[1], 'r')

plt.ylim([0, 1200])

addr = "00:07:80:36:A6:03"
def update_line(i, data):
    global ydata
    global lines
    ydata[i].append(data)
    ydata[i] = ydata[i][1:]

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
        update_line(0, js["ShoulderFlexZ_L"])
        update_line(1, js["ShoulderFlexZ_R"])
        line_buf = line_buf[1:];
        changed = True
    if len(data) == 0: break
    if changed:
        for i in range(len(ydata)):
            lines[i].set_xdata(numpy.arange(len(ydata[i])))
            lines[i].set_ydata(ydata[i])
        if (time.time() - lastDraw) > 0.01:
            plt.draw()
            lastDraw = time.time()
    #sock.send(data)

sock.close()
