var mysql      = require('mysql');
var c = mysql.createConnection({
  host     : 'localhost',
  socketPath : '/var/run/mysqld/mysqld.sock',
  user     : 'root',
  password : 'jalla',
});

// INSERT INTO Sensors VALUES (`SENSOR01`, `kinetic`, `Shoulder`)

c.connect(function(err){
  if(err){
    console.log('Error connecting to Db: ' + err.message);
    return;
  }
  console.log('Connection established');
});

var query = c.query('SELECT * FROM Sensors', function(err, result) {
	console.log("query returned with " + result + " / " + result)
});

console.log("SQL> " + query.sql); // INSERT INTO posts SET `id` = 1, `title` = 'Hello MySQL'


c.end(function(err) {
  // The connection is terminated gracefully
  // Ensures all previously enqueued queries are still
  // before sending a COM_QUIT packet to the MySQL server.
});