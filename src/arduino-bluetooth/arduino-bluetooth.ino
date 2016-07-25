//Futuwear "smart" clothing
//Firmware for Atmega32u4/Teensy
//Compile with Arduino IDE + Teensyduino

//Elmo von Weissenberg

#include "iwrapper.h"
#include "sensors.h"
#include "communication.h"
#include "uuid.h"
//#include <MemoryFree.h>


void setup() {
    fetch_uuid();
    sensors_init();
    iwrapper_setup();
    communication_init();
    Serial.print("Device UUID: ");
    Serial.println(DEVICE_UUID_STR);
    send_configuration();
}

void loop() {
  iwrapper_loop();
  sensors_update();
}
