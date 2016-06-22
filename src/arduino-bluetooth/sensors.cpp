#include "sensors.h"
#include "communication.h"
#include <math.h>

unsigned long lastSensorsUpdate = 0;

//List of all sensors connected.
Sensor sensorList[NUM_SENSORS] = {
    {FLEX, "ShoulderFlexZ_L", A0},
    {FLEX, "ShoulderFlexZ_R", A1},
};

void sensors_init() {
    for (int i=0; i < NUM_SENSORS; i++) {
        sensor_init(&sensorList[i]);
    }
}

void sensors_update() {
    if ((millis() - lastSensorsUpdate) > SENSOR_UPDATE_INTERVAL) {
        for (int i=0; i < NUM_SENSORS; i++) {
            sensor_update(&sensorList[i]);
        }
        lastSensorsUpdate = millis();
        //Serial.println();
        send_sensor_data();
    }
}

void sensor_init(Sensor *s) {
    pinMode(s->pin, INPUT);
    s->filteredValue = 0.0;
    s->raw_min = 1023;
    s->raw_max = 0;
}

void sensor_update(Sensor *s) {
    if (s->pin < 0) { //undefined pin
        return;
    }
    float reading;
    if (s->type == FLEX) {
        reading = analogRead(s->pin);

        if (reading < s->raw_min) {s->raw_min = reading;}
        if (reading > s->raw_max) {s->raw_max = reading;}
    }

    //exponential smoothing
    s->filteredValue = SMOOTH_FACTOR*reading + (1 - SMOOTH_FACTOR)*s->filteredValue;

    s->outValue = map(round(s->filteredValue), s->raw_min, s->raw_max, 0, 1000);
    /*Serial.print(s->name);
    Serial.print(": ");
    Serial.print(s->outValue);
    Serial.print(" ");*/
}
