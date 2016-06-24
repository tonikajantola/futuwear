#include "communication.h"

uint8_t lastReceivedChannel = 128;
uint32_t packetIndex = 0;

void communication_init() {
    iwrap_callback_rxdata = communication_rx_callback;
    lastReceivedChannel = 128;
    packetIndex = 0;
}

void communication_rx_callback(uint8_t packet_channel, uint16_t, const unsigned char *data) {
    serial_out(F("========\nReceived data: "));
    serial_out((const char *)data);
    serial_out(F("\n========\n"));
    lastReceivedChannel = packet_channel;
}

void build_data_json(char *buffer, size_t len) {
    #ifdef USE_ARDUINOJSON
        StaticJsonBuffer<200> jsonBuffer;
        JsonObject& dump = jsonBuffer.createObject();
        dump["packetID"] = packetIndex++;
        JsonArray& data = dump.createNestedArray("sensorData");
    #else
        aJsonObject *dump = aJson.createObject();
    #endif
    //if (!dump) {Serial.println(F("****ERROR*** couldn't create dump object!"));}

    for (int i=0; i < NUM_SENSORS; i++) {
        #ifdef USE_ARDUINOJSON
            JsonObject& field = data.createNestedObject();
            field["name"]   = sensorList[i].name;
            field["value"]  = sensorList[i].outValue;
        #else
            aJsonObject *data = aJson.createObject();
            if (!data) {Serial.println(F("****ERROR*** couldn't create data object!"));}

            aJson.addItemToObject(dump, "sensorData", data);
            aJson.addStringToObject(data, "name", sensorList[i].name);
            aJson.addNumberToObject(data, "value", sensorList[i].outValue);
        #endif
    }
    #ifdef USE_ARDUINOJSON
        dump.printTo(buffer, len);
    #else
        //char *output = aJson.print(dump);
        //aJson.deleteItem(dump);
    #endif
}

void send_sensor_data() {
    if (lastReceivedChannel == 128) {return;}

    char output[128];
    build_data_json(output, sizeof(output));
    strncat(output, "\n", sizeof(output));

    //Serial.println(output);
    iwrap_send_data(lastReceivedChannel, strlen(output), (uint8_t*)output, IWRAP_MODE_MUX);
    //free(output);
    //iwrap_send_data(lastReceivedChannel, 2, (uint8_t*)"\n", IWRAP_MODE_MUX);
}
