The Server
==========

To run the server, execute *node run*. Make sure that 
* you have a running [Vör])(https://github.com/futurice/vor) server
* you have a running MySQL server with the schema created by /server/dev/db-setup.sql
* your */server/connection-strings.js* has the login info for that database
* the constants at the top of run.js match your setup

Communications
----------------

### /fetch (HTTP GET)
Will get sensor data from the database between two times (EPOCH seconds) passed as json:
´data={time0: 0, timeT: 1470211214}´
Only devices stored in the cookie will be considered.

### 'connection' (Socket.io message)
Will return the client their socket ID.

### 'registration' (Socket.io message)
After 'connection' is fired, this method will acknowledge


