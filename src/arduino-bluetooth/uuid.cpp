#include "uuid.h"

uint8_t EEMEM eeprom_device_uuid_generated_check[4];
uint8_t EEMEM eeprom_device_uuid_str[36];

char DEVICE_UUID_STR[37] = {0};

bool is_uuid_generated() {
    char v[5] = {0};
    eeprom_read_block((void*)v, (const void*)eeprom_device_uuid_generated_check, 4);
    return strcmp(v, UUID_CHECK_STRING) == 0;
}


void generate_uuid() {
    uint8_t uuid_bytes[16];
    TrueRandom.uuid(uuid_bytes);

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
    eeprom_update_block((const void*)DEVICE_UUID_STR, (void*)eeprom_device_uuid_str, 36);
    eeprom_update_block((const void*)UUID_CHECK_STRING, (void*) eeprom_device_uuid_generated_check, 4);
}

void fetch_uuid() {
    if (!is_uuid_generated()) {
        Serial.println("Generating fresh UUID");
        generate_uuid();
    } else {
        eeprom_read_block((void*)DEVICE_UUID_STR, (const void*)eeprom_device_uuid_str, 36);
    }
}
