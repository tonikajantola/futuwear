//Futuwear "smart" clothing
//Firmware for Atmega32u4/Teensy
//Compile with Arduino IDE + Teensyduino

//Elmo von Weissenberg

#include "iwrapper.h"
#include "sensors.h"
#include "communication.h"
#include "uuid.h"
//#include <MemoryFree.h>

#define INDICATOR_LED 11

bool led_state = false;
unsigned long led_last_blink = 0;

void setup() {
    pinMode(11, OUTPUT);
    iwrapper_setup();
    sensors_init();
    communication_init();
    fetch_eeprom_configuration();
    send_configuration();
}

void loop() {
    if (millis() > (led_last_blink + 50)) {

        Serial.print("We're awake:");
        Serial.println(led_last_blink);

        if (iwrap_initialized) {
            if (iwrap_active_connections) {
                led_state = !led_state;
            } else {
                led_state = true;
            }
        } else {
            led_state = false;
        }
        led_last_blink = millis();
        digitalWrite(INDICATOR_LED, led_state);
    }
    iwrapper_loop();
    sensors_update();
}
