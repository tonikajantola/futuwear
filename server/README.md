The Server
==========

To run the server, execute *node run*. Make sure that 
* you have a running [Vör](https://github.com/futurice/vor) server
* you have a running MySQL server with the schema created by /server/dev/db-setup.sql
* your */server/connection-strings.js* has the login info for that database
* the constants at the top of run.js match your setup

Communication
-------------

### /fetch (HTTP GET)

Will get sensor data from the database between two times (EPOCH seconds) passed as json:
`data={time0: 0, timeT: 1470211214}`
Only devices stored in the cookie will be considered.

### /register (HTTP GET)

Will register a new smart shirt. The fields *uuid* and *name* must both be unique. In addition, field *pin* is required for data authentication, and it should not be sent as plain text after initial registration.

### 'connection' (Socket.io server message)

Will return the user their socket ID.

### 'registration' (Socket.io server message)

After 'connection' is fired, this one-time method enables the client to receive device-specific user notifications as Socket.io messages, routed by the socket ID.

### 'message' (Socket.io client message)

Caught directly from Vör, containing fresh sensor data in JSON form. The field *token* must be a valid hash of the required field *sensors* (without whitespace), salted with the device-specific *uuid* + *pin* (respective JSON fields are also required). If the hash check fails, the data will not be saved into the database. Field *name* is required for displaying the data to the user.
`{"sensors":[{"name":"Back_X","collection":[{"value":500}]},{"name":"Back_Y","collection":[{"value":451}]}],"token":"8c5d77119c30f0b86ad633860ef58c7c","uuid":"9c1411ea-7317-48fb-8918-7845bda87441","name":"test-device"}`





