#include "uuid.h"

uint8_t EEMEM eeprom_device_uuid_generated_check[4]; //No default values written in EEPROM.
uint8_t EEMEM eeprom_device_uuid_str[36];            //Fresh chips generate a fresh UUID upon boot.

uint8_t EEMEM eeprom_device_pin_str[PIN_SIZE*2]; //hexadecimal character array
uint8_t EEMEM eeprom_device_friendly_name[64];

const char *DEVICE_UUID_STR = "14f13e11-29c7-4321-a93d-02fbe22617d7";
const char *DEVICE_PIN_STR = "4e753ac506834e709e16022459d28ec9";

/*
bool is_uuid_generated() { //Read the check string
    char v[5] = {0};
    eeprom_read_block((void*)v, (const void*)eeprom_device_uuid_generated_check, 4);
    return strcmp(v, UUID_CHECK_STRING) == 0;
}

void generate_pin() {
    uint8_t pin_bytes[PIN_SIZE];
    TrueRandom.memfill((char*)pin_bytes, PIN_SIZE);

    int p = 0;
    for (int i=0; i < PIN_SIZE; i++) {
        //Copycat from TrueRandom example code
        int topDigit = pin_bytes[i] >> 4;
        int bottomDigit = pin_bytes[i] & 0x0f;
        DEVICE_PIN_STR[p++] = "0123456789abcdef"[topDigit];
        DEVICE_PIN_STR[p++] = "0123456789abcdef"[bottomDigit];
        //End of copycat
    }
    DEVICE_PIN_STR[p++] = 0;
    eeprom_update_block((const void*)DEVICE_PIN_STR, (void*)eeprom_device_pin_str, PIN_SIZE*2 + 1);
}

void generate_uuid() {
    uint8_t uuid_bytes[16];
    TrueRandom.uuid(uuid_bytes);
    Serial.println("Generated random data");
    int p = 0;
    for (int i=0; i < 16; i++) {
        if (i==4 || i==6 || i==8 || i==10) {
            DEVICE_UUID_STR[p++] = '-';
        }

        //Copycat from TrueRandom example code
        int topDigit = uuid_bytes[i] >> 4;
        int bottomDigit = uuid_bytes[i] & 0x0f;
        DEVICE_UUID_STR[p++] = "0123456789abcdef"[topDigit];
        DEVICE_UUID_STR[p++] = "0123456789abcdef"[bottomDigit];
        //End of copycat
    }
    Serial.println("Generating pin");
    generate_pin();

    eeprom_update_block((const void*)DEVICE_UUID_STR, (void*)eeprom_device_uuid_str, 36);
    eeprom_update_block((const void*)UUID_CHECK_STRING, (void*) eeprom_device_uuid_generated_check, 4);
}


*/
void fetch_eeprom_configuration() {
    /*if (!is_uuid_generated()) {
        Serial.println("Generating fresh UUID-PIN pair");
        generate_uuid();
        Serial.println("Generated");
    } else {
        eeprom_read_block((void*)DEVICE_UUID_STR, (const void*)eeprom_device_uuid_str, 36);
        eeprom_read_block((void*)DEVICE_PIN_STR, (const void *)eeprom_device_pin_str, PIN_SIZE*2);
    }*/
    //Disabled due to laziness and TrueRandom reading A0, which is pulled up without entropy.
}
