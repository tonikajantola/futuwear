#include "communication.h"

uint32_t packetIndex = 0;

uint8_t packetBuffer[PACKET_BUF_SIZE];
uint8_t packet_buffer_size = 0;

void communication_init() {
    iwrap_callback_rxdata = communication_rx_callback;
    //lastReceivedChannel = 128;
    packetIndex = 0;
}

//Called upon receiving data
void communication_rx_callback(uint8_t packet_channel, uint16_t, const unsigned char *data) {
    serial_out(F("========\nReceived data: "));
    serial_out((const char *)data);
    serial_out(F("\n========\n"));
    surefire_connection_id = packet_channel; //Client software is expected to spam some line of data.
}

//Called upon connection
void my_iwrap_evt_ring(uint8_t link_id, const iwrap_address_t *address, uint16_t channel, const char *profile) {
    //add_mapped_connection(link_id, address, profile, channel);
    iwrap_active_connections++;
    surefire_connection_id = link_id;
}

void send_data(char* output) {
    iwrap_send_data(surefire_connection_id, strlen(output), (uint8_t*)output, IWRAP_MODE_MUX);
    Serial1.flush();
}

void build_data_json(char *buffer, int len) {
    StaticJsonBuffer<200> jsonBuffer;
    JsonObject& dump = jsonBuffer.createObject();
    //dump["packetID"] = packetIndex++;
    //JsonObject& data = dump.createNestedObject("sensorData");
    JsonArray& data = dump.createNestedArray("sensorData");

    for (int i=0; i < NUM_SENSORS; i++) {
        //sensorList[i]->dump_data(dump);
        //field["value"]  = sensorList[i].value.out;
        //data[sensorList[i].name] = sensorList[i].value.out;
    }
    packetIndex++;
    dump.printTo(buffer, len);
    //BluetoothStream b;
    //dump.printTo(b);
    //b.println();;
    //b.println("lolwhat");
    //iwrap_send_data(surefire_connection_id, 4, (const uint8_t*)"wtf\n", IWRAP_MODE_MUX);

}

void build_single_data_json(int sensor_index, char *buffer, int len) {
    StaticJsonBuffer<200> jsonBuffer;
    JsonObject& dump = jsonBuffer.createObject();
    JsonObject& data = dump.createNestedObject("sensorData");
    /*
    dump[sensorList[sensor_index].name] = sensorList[sensor_index].value.out;
    */
    //sensorList[sensor_index]->dump_data(data);
    data["name"]    = sensorList[sensor_index].name;
    data["value"]   = sensorList[sensor_index].value.out;
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
        send_data(output);
    }
    Serial.print("Current connections: ");
    Serial.println(iwrap_active_connections);
}

void send_configuration() {
    char output[256];
    StaticJsonBuffer<100> buffer;
    JsonObject& dump = buffer.createObject();
    JsonObject& config = dump.createNestedObject("configuration");
    config["uuid"] = DEVICE_UUID_STR;
    dump.printTo(output, sizeof(output));

    strncat(output, "\n", sizeof(output));
    send_data(output);
}
