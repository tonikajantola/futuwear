const socketIO = require('socket.io-client');

function connected() {
	console.log("Gonna emit man.")
	client.emit('message', {txt:"test"})
}

const client = socketIO.connect("http://futuwear.tunk.org:13337");
client.on('connect', () => connected());