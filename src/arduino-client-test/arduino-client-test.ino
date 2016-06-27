#include <ESP8266WiFi.h>
#include "cJSON.h"
#include <string.h>


const char* ssid     = "Eino-Huawei-Y6";
const char* password = "jeejeejoojoo";


/*
const char* ssid     = "Futurice-Guest-Helsinki";
const char* password = "isitfriday";
*/

const char* host = "futuwear.tunk.org";
const char* jsonData = "data={\"timestamp\":1466076661337,\"input\":\"alex on nortti\"}";


void setup() {
  Serial.begin(115200);
  delay(10);

  // We start by connecting to a WiFi network

  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");  
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

int value = 0;

void loop() {
  delay(5000);
  ++value;

  Serial.print("connecting to ");
  Serial.println(host);
  
  // Use WiFiClient class to create TCP connections
  WiFiClient client;
  const int httpPort = 8080;
  if (!client.connect(host, httpPort)) {
    Serial.println("connection failed");
    return;
  }
  
  Serial.println(String("### DEBUG: Content-Length:") + strlen(jsonData));
  
  // This will send the request to the server
  client.print(String("POST ") + "/" + " HTTP/1.1\r\n" +
               "Host: " + host + ":" + httpPort + "\r\n" + 
               "Content-Type: application/x-www-form-urlencoded; charset=UTF-8\r\n" +
               "Content-Length: " + strlen(jsonData) + "\r\n" +
               "Connection: close\r\n\r\n" + jsonData);

  Serial.println("----------------------------------------------------");
  
  Serial.println(String("POST ") + "/" + " HTTP/1.1\r\n" +
               "Host: " + host + ":" + httpPort + "\r\n" + 
               "Content-Type: application/x-www-form-urlencoded; charset=UTF-8\r\n" +
               "Content-Length: " + strlen(jsonData) + "\r\n" +
               "Connection: close\r\n\r\n" + jsonData);

  Serial.println("----------------------------------------------------");
               
  
  unsigned long timeout = millis();
  while (client.available() == 0) {
    if (millis() - timeout > 5000) {
      Serial.println(">>> Client Timeout !");
      client.stop();
      return;
    }
  }
  
  // Read all the lines of the reply from server and print them to Serial
  while(client.available()){
    String line = client.readStringUntil('\r');
    Serial.print(line);
  }
  
  Serial.println();
  Serial.println("closing connection");
}

