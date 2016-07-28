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
    pinMode(11, OUTPUT);
    iwrapper_setup();
    sensors_init();
    communication_init();
    delay(1000);
    digitalWrite(11, LOW);
    fetch_eeprom_configuration();
    digitalWrite(11, HIGH);
    send_configuration();
}

void loop() {
  iwrapper_loop();
  sensors_update();
}
