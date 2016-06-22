#include "communication.h"

uint8_t lastReceivedChannel = 128;

void communication_init() {
    iwrap_callback_rxdata = communication_rx_callback;
    lastReceivedChannel = 128;
}

void communication_rx_callback(uint8_t packet_channel, uint16_t, const unsigned char *data) {
    serial_out(F("========\nReceived data: "));
    serial_out((const char *)data);
    serial_out(F("\n========\n"));
    lastReceivedChannel = packet_channel;
}

void send_sensor_data() {
    if (lastReceivedChannel == 128) {return;}

    aJsonObject *dump = aJson.createObject();
    if (!dump) {Serial.println(F("****ERROR*** couldn't create dump object!"));}

    for (int i=0; i < NUM_SENSORS; i++) {
        //char buf[128];
        //snprintf(buf, 128, "{\"%s\": %d}", sensorList[i].name, sensorList[i].outValue);
        //data.concat(buf);
        //if (i != (NUM_SENSORS-1)) {
        //    data.concat(",");
        //}
        aJsonObject *data = aJson.createObject();
        if (!data) {Serial.println(F("****ERROR*** couldn't create data object!"));}
        aJson.addItemToObject(dump, "sensorData", data);
        aJson.addStringToObject(data, "name", sensorList[i].name);
        aJson.addNumberToObject(data, "value", sensorList[i].outValue);
    }
    Serial.println(F("Created JSON"));
    char *output = aJson.print(dump);
    aJson.deleteItem(dump);
    //output += "\n";
    Serial.println(output);
    iwrap_send_data(lastReceivedChannel, strlen(output), (uint8_t*)output, IWRAP_MODE_MUX);
    free(output);
    iwrap_send_data(lastReceivedChannel, 2, (uint8_t*)"\n", IWRAP_MODE_MUX);
}
