#include <ESP8266WiFi.h>
#include "cJSON.h"
#include <string.h>
#include <stdarg.h>

int i=0;

const char* ssid     = "Eino-Huawei-Y6";
const char* password = "jeejeejoojoo";


/*
const char* ssid     = "Futurice-Guest-Helsinki";
const char* password = "isitfriday";
*/

const char* host = "futuwear.tunk.org";

cJSON *jsonData;


void flush() {
  for(i;i<1000;i++) {
    Serial.println();
    i=0;
  }
}

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
  delay(1000);
  ++value;

  Serial.print("connecting to ");
  Serial.println(host);
  
  // Use WiFiClient class to create TCP connections
  WiFiClient client;
  const int httpPort = 80;
  if (!client.connect(host, httpPort)) {
    Serial.println("connection failed");
    return;
  }


  jsonData = cJSON_CreateObject();  
  cJSON_AddStringToObject(jsonData, "input", "alex on kiva poika");
  cJSON_AddNumberToObject(jsonData, "timestamp", 1466076661337);

    
  //Serial.println(String("### DEBUG: Content-Length:") + strlen(cJSON_Print(jsonData)));

  //flush();
  
  // This will send the request to the server
  client.print(String("POST ") + "/" + " HTTP/1.1\r\n" +
               "Host: " + host + ":" + httpPort + "\r\n" + 
               "Content-Type: application/x-www-form-urlencoded; charset=UTF-8\r\n" +
               "Content-Length: " + strlen(cJSON_Print(jsonData)) + "\r\n" +
               "Connection: close\r\n\r\n" + cJSON_Print(jsonData));

  Serial.println();
  Serial.println("----------------------------------------------------");
  
  Serial.print(String("POST ") + "/" + " HTTP/1.1\r\n" +
               "Host: " + host + ":" + httpPort + "\r\n" + 
               "Content-Type: application/x-www-form-urlencoded; charset=UTF-8\r\n" +
               "Content-Length: " + strlen(cJSON_Print(jsonData)) + "\r\n" +
               "Connection: close\r\n\r\n" + cJSON_Print(jsonData));

  Serial.println("----------------------------------------------------");
               
 
  unsigned long timeout = millis();
  while (client.available() == 0) {
    if (millis() - timeout > 5000) {
      Serial.println(">>> Client Timeout !");
      client.stop();
      return;

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
  
  // Read all the lines of the reply from server and print them to Serial
  while(client.available()){
    String line = client.readStringUntil('\r');
    Serial.print(line);
  }
  
  Serial.println();
  Serial.println("closing connection");
  
}
