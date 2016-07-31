#ifndef UUID_H
#define UUID_H

#include <Arduino.h>
#include <stdbool.h>
#include <avr/eeprom.h>
#include <string.h>
#include <TrueRandom.h>
#include "iwrapper.h"
//Written in EEPROM to check whether a new UUID needs to be generated.
//Change this to generate a fresh one
//This is mostly for checking whether the chip's EEPROM is fresh
//and full of zeros/garbage data.
//This is used for resetting the friendly name as well.
#define UUID_CHECK_STRING "FUTU"
#define PIN_SIZE 32 //bytes

#define FRIENDLY_NAME_SIZE 21
#define FRIENDLY_NAME_DEFAULT "Futuwear_v0.2"
//extern uint8_t eeprom_device_uuid_generated_check[4];
//extern uint8_t eeprom_device_uuid_str[36];

//extern uint8_t eeprom_device_pin_str[PIN_SIZE*2];
extern uint8_t eeprom_device_friendly_name[FRIENDLY_NAME_SIZE];

//Preloaded in RAM
extern const char *DEVICE_UUID_STR;//[37];
extern const char *DEVICE_PIN_STR;//[PIN_SIZE*2 + 1];
extern char DEVICE_FRIENDLY_NAME[FRIENDLY_NAME_SIZE + 1];

void generate_uuid(); //Randomly generate a fresh one
bool is_uuid_generated();
void set_friendly_name(const char *str);
void fetch_eeprom_configuration(); //Read from memory, or generate it
#endif
