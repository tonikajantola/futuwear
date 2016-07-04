from socketIO_client import SocketIO, LoggingNamespace

socket = SocketIO('futuwear.tunk.org', 13337, LoggingNamespace)

def connected(*args):
	global socketIO
	print("Gonna emit")
	socket.emit('message', {'xxx': 'yyy'})
	
socket.on("connect", connected)
socket.wait(seconds=5)
	