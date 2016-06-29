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

if sys.version < '3':
    input = raw_input

#stdscr = curses.initscr();

addr = "00:07:80:36:A6:03"
"""
if len(sys.argv) < 2:
    print("no device specified.  Searching all nearby bluetooth devices for")
    print("the SampleServer service")
else:
    addr = sys.argv[1]
    print("Searching for SampleServer on %s" % addr)

# search for the SampleServer service
uuid = None
service_matches = find_service( address = addr, uuid = None )#uuid = uuid, address = addr )

if len(service_matches) == 0:
    print("couldn't find the SampleServer service =(")
    sys.exit(0)

first_match = service_matches[0]
port = first_match["port"]
name = first_match["name"]
host = first_match["host"]

print("connecting to \"%s\" on %s, port %s" % (name, host, port))
"""
# Create the client socket
sock=BluetoothSocket( RFCOMM )
#sock.connect((host, port))
sock.connect((addr, 1))

sock.send("READY\n");

buf = "";
line_buf = [];
print("connected.  type stuff")
while True:
    data = sock.recv(128).decode("utf-8");
    buf += data;
    line_buf = buf.split("\n");
    buf = line_buf[-1];
    #if len(data) == 0: break
    while (len(line_buf) > 1):
        #send line_buf[0] over socketIO
        print(line_buf[0]);
        line_buf = line_buf[1:];

sock.close()
