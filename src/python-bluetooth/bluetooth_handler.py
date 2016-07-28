from bluetooth import *
import sys
import hashlib

bt_addr = "00:07:80:36:A6:0D" # The MAC address of the device in question

bt_connection = False
bt_socket = None

def init():
    global bt_socket
    global bt_connection
    # Create the client socket
    bt_socket = BluetoothSocket( RFCOMM )

    bt_connection = False
    channel=1
    while not bt_connection:
        try:
            print("Connecting to ", bt_addr, "channel", channel, "...")
            #sys.stdout.flush()
            bt_socket.connect((bt_addr, channel))
            bt_connection = True
        except Exception as e:
            print("FAIL:", str(e))
            channel+=1
            if (channel>10):
                channel=1

    print("SUCCESS")
    bt_socket.send("READY\n");

def finish():
    global bt_socket
    global bt_connection
    if (bt_socket):
        bt_socket.close()
        bt_connection = False
        bt_socket = None

buf = "";
line_buf = [];

def dataAvailable():
    if bt_connection and bt_socket:
        return (len(line_buf) > 1)
    return False

def nextLine():
    global line_buf
    if dataAvailable():
        ret = line_buf[0]
        line_buf = line_buf[1:]
        return ret
    return None

def readData():
    global line_buf
    global buf
    data = bt_socket.recv(128).decode("utf-8", errors="ignore");
    buf += data
    line_buf += buf.split("\n")
    buf = line_buf[-1]
    line_buf = line_buf[:-1]
