'use strict';
const http = require('http');
const socketIO = require('socket.io-client');

// get envs
const SOCKET_SERVER = "http://futuwear.tunk.org:13337/"; // 82.130.28.79 


// create server
const app = http.createServer((request, response) => {
  console.log(`Client request : ${new Date()}`);
  response.writeHead(200);
  response.end();
});
app.listen(9000, console.log(`Client listening :9000: ${new Date()}`));

// connect to socket server
const client = socketIO.connect(SOCKET_SERVER);
console.log(`Client trying to connect ${SOCKET_SERVER} : ${new Date()}`);
client.on('connect', () => console.log(`Client socket connected ${SOCKET_SERVER} : ${new Date()}`));
client.on('disconnect', () => console.log(`Client socket disconnected ${SOCKET_SERVER} :  ${new Date()}`));
client.on('reconnect_attempt', error => console.error(`Error - cannot connect to ${SOCKET_SERVER} : ${error} : ${new Date()}`));
client.on('error', error => console.error(`Error - socket connection: ${error} : ${new Date()}`));

client.on('message', msg => console.error(`Got: ${JSON.stringify(msg)}`));

/*
// Trigger camera frequently.
const triggerCameraSource$ = Rx.Observable.interval(UPDATE_TIME)
  .flatMap(camera.takePicture)
  .retry()
  .subscribe(
    imageString => {
      client.emit('message', {
        type: SEND_TYPE,
        id: SEND_ID,
        image: imageString
      });
      console.log(`Client emit message to ${SOCKET_SERVER} :  ${new Date()}`);
    },
    error => console.error(`Error - unable to take picture: ${error} : ${new Date()}`)
  );
module.exports = app;

*/