#include "communication.h"

uint32_t packetIndex = 0;

uint8_t packetBuffer[PACKET_BUF_SIZE];
uint8_t packet_buffer_size = 0;

void communication_init() {
    iwrap_callback_rxdata = communication_rx_callback;
    //lastReceivedChannel = 128;
    packetIndex = 0;
}

void communication_rx_callback(uint8_t packet_channel, uint16_t, const unsigned char *data) {
    serial_out(F("========\nReceived data: "));
    serial_out((const char *)data);
    serial_out(F("\n========\n"));
    surefire_connection_id = packet_channel;
}
#define USE_ARDUINOJSON
void build_data_json(char *buffer, int len) {
    #ifdef USE_ARDUINOJSON
        StaticJsonBuffer<200> jsonBuffer;
        JsonObject& dump = jsonBuffer.createObject();
        //dump["packetID"] = packetIndex++;
        //JsonObject& data = dump.createNestedObject("sensorData");
        JsonArray& data = dump.createNestedArray("sensors");
    #else
        aJsonObject *dump = aJson.createObject();
    #endif
    //if (!dump) {Serial.println(F("****ERROR*** couldn't create dump object!"));}

    for (int i=0; i < NUM_SENSORS; i++) {
        #ifdef USE_ARDUINOJSON
            JsonObject& sensor = data.createNestedObject();
            sensor["name"]          = sensorList[i].name;
            sensor["description"]   = "None";
            JsonArray& collection  = sensor.createNestedArray("collection");
            JsonObject& value       = collection.createNestedObject();
            value["value"]          = sensorList[i].value.out;
            value["timestamp"]      = packetIndex;
            //field["value"]  = sensorList[i].outValue;
            //data[sensorList[i].name] = sensorList[i].outValue;
        #else
            aJsonObject *data = aJson.createObject();
            if (!data) {Serial.println(F("****ERROR*** couldn't create data object!"));}

            aJson.addItemToObject(dump, "sensorData", data);
            aJson.addStringToObject(data, "name", sensorList[i].name);
            aJson.addNumberToObject(data, "value", sensorList[i].outValue);
        #endif
    }
    packetIndex++;
    #ifdef USE_ARDUINOJSON
        dump.printTo(buffer, len);
        //BluetoothStream b;
        //dump.printTo(b);
        //b.println();;
        //b.println("lolwhat");
        //iwrap_send_data(surefire_connection_id, 4, (const uint8_t*)"wtf\n", IWRAP_MODE_MUX);
    #else
        //char *output = aJson.print(dump);
        //aJson.deleteItem(dump);
    #endif
}

void build_single_data_json(int sensor_index, char *buffer, int len) {
    StaticJsonBuffer<200> jsonBuffer;
    JsonObject& dump = jsonBuffer.createObject();

    dump[sensorList[sensor_index].name] = sensorList[sensor_index].value.out;
    dump.printTo(buffer, len);
}

size_t BluetoothStream::write(uint8_t data) {
    if (packet_buffer_size == 0) {
      //Serial1.flush();
    }
    packetBuffer[packet_buffer_size++] = data;
    if (data == '\n' || packet_buffer_size == PACKET_BUF_SIZE) {
        iwrap_send_data(surefire_connection_id,packet_buffer_size, packetBuffer, IWRAP_MODE_MUX);
        Serial1.flush();
        //memset(packetBuffer, 0, PACKET_BUF_SIZE);
        packet_buffer_size = 0;
    }
    return 1;
}
/*
size_t BluetoothStream::write(const uint8_t *data) {
    unsigned int len = strlen(data);
    iwrap_send_data(surefire_connection_id, len, (const uint8_t*)data, IWRAP_MODE_MUX);
    return len;
}*/

void send_sensor_data() {
    if (surefire_connection_id == 0xFF) {return;}

    /*char output[512];
    build_data_json(output, sizeof(output));
    //build_data_json();
    strncat(output, "\n", sizeof(output));

    //Serial.println(output);
    iwrap_send_data(surefire_connection_id, strlen(output), (uint8_t*)output, IWRAP_MODE_MUX);
    Serial1.flush();
    */

    for (int i=0; i < NUM_SENSORS; i++) {
        char output[256];
        build_single_data_json(i, output, sizeof(output));
        //build_data_json();
        strncat(output, "\n", sizeof(output));

        //Serial.println(output);
        iwrap_send_data(surefire_connection_id, strlen(output), (uint8_t*)output, IWRAP_MODE_MUX);
        Serial1.flush();
    }
}
