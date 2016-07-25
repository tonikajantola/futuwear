#ifndef UUID_H
#define UUID_H

#include <Arduino.h>
#include <stdbool.h>
#include <avr/eeprom.h>
#include <string.h>
#include <TrueRandom.h>

//Written in EEPROM to check whether a new UUID needs to be generated.
//Change this to generate a fresh one
#define UUID_CHECK_STRING "UUID"

extern uint8_t eeprom_device_uuid_generated_check[4];
extern uint8_t eeprom_device_uuid_str[36];

extern char DEVICE_UUID_STR[37];

void generate_uuid(); //Randomly generate a fresh one
bool is_uuid_generated();
void fetch_uuid(); //Read from memory, or generate it
#endif
