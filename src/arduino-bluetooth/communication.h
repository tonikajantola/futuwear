#ifndef COMMUNICATION_H
#define COMMUNICATION_H
#include "iwrapper.h"
#include "sensors.h"

#define USE_ARDUINOJSON
#define PACKET_BUF_SIZE 1

#ifdef USE_ARDUINOJSON
    #include <ArduinoJson.h>
#else
    #include <aJSON.h>
#endif

void communication_init();
void communication_rx_callback(uint8_t packet_channel, uint16_t, const unsigned char *data);
void send_sensor_data();

class BluetoothStream : public Print {
    virtual size_t write(uint8_t);
    //virtual size_t write(const char *str);
};

#endif
