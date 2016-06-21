#include <ESP8266WiFi.h>
#include "cJSON.h"
#include <string.h>
#include <stdarg.h>

const char* ssid     = "aalto open";
const char* password = "";


/*
const char* ssid     = "Futurice-Guest-Helsinki";
const char* password = "isitfriday";
*/

const char* host = "futuwear.tunk.org";

void s_printf(char *buf, char *fmt, ... ){
        va_list args;
        va_start (args, fmt );
        vsnprintf(buf, 128, fmt, args);
        va_end (args);
}

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
  bool isAlive = true;
  delay(100);
  ++value;

  Serial.print("connecting to ");
  Serial.println(host);
  
  // Use WiFiClient class to create TCP connections
  WiFiClient client;
  const int httpPort = 13337;
  
  if (!client.connect(host, httpPort)) {
    Serial.println("connection failed");
    return;
  }

  while(isAlive) {
    int sensorValue = analogRead(A0);
    int timeOffset = 0;
    // char* jsonData = "{\"sensors\":1466076661337,\"input\":\"alex on nortti\"}";
    char jsonData[256];
    // (String("{\"sensors\":{\"name\":\"flex1\",\"collection\":[{\"value\":") + String(sensorValue) + String(",\"timestamp\":") + String(timeOffset) + String("}]}}")).c_str();
    s_printf(jsonData, "{\"sensors\":{\"name\":\"flex1\",\"collection\":[{\"value\":%d,\"timestamp\":%d}]}}", sensorValue, timeOffset);
    Serial.println(String("### DEBUG: Content-Length:") + strlen(jsonData));
    
    // This will send the request to the server
    String request = (String("POST ") + "/messages/" + " HTTP/1.1\r\n" +
                 "Host: " + host + ":" + httpPort + "\r\n" + 
                 "Content-Type: application/json; charset=UTF-8\r\n" +
                 "Content-Length: " + strlen(jsonData) + "\r\n" +
                 "Connection: keep-alive\r\n\r\n" + jsonData);

    Serial.println("Sending request...");
    client.print(request);
    Serial.println("----------------------------------------------------");
    
    Serial.println(request);
  
    Serial.println("----------------------------------------------------");
                 
    Serial.println("Waiting for response");
    unsigned long timeout = millis();
    while (client.available() == 0) {
      if (millis() - timeout > 400) {
        Serial.println(">>> Client Timeout !");
        Serial.println("closing connection");
        client.stop();
        isAlive = false;
        break;
      }
    }
    Serial.println("Reading response");
    timeout = millis();
    // Read all the lines of the reply from server and print them to Serial
    while(client.available() && (millis() - timeout < 100)){
      String line = client.readString();
      Serial.print(line);
    }
    Serial.println("Stopped reading");
  }
}

