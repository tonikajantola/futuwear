#include "sensors.h"
#include "communication.h"
#include <math.h>

unsigned long lastSensorsUpdate = 0;
unsigned long lastDataDump = 0;

bool ledBlink = false;

//List of all sensors connected.
Sensor sensorList[NUM_SENSORS] = {
    {RESISTOR_DIVIDER, "L_Shoulder_Y_Rot",  A2, {0}},
    {RESISTOR_DIVIDER, "R_Shoulder_Y_Rot",  A4, {0}},
    {RESISTOR_DIVIDER, "L_Shoulder_X_Rot",  A1, {1}},
    {RESISTOR_DIVIDER, "R_Shoulder_X_Rot",  10, {0}},
    {RESISTOR_DIVIDER, "Back_X",            9, {0}},
    {RESISTOR_DIVIDER, "Back_Y",            8, {0}},
    {RESISTOR_DIVIDER, "R_Pressure",        A0, {1}}
    //,
    //{RESISTOR_DIVIDER, "Stretch2", A2, {0}},
    //{RESISTOR_DIVIDER, "Stretch3", A3, {0}},
    //{RESISTOR_DIVIDER, "Stretch4", A4, {0}},
    //{RESISTOR_DIVIDER, "Stretch5", A5, {0}},
    //{RESISTOR_DIVIDER, "Stretch6", A6, {0}},
    //{RESISTOR_DIVIDER, "Stretch7", A7, {0}},
    //{RESISTOR_DIVIDER, "Stretch8", A8, {0}},
    //{RESISTOR_DIVIDER, "Stretch9", A9, {0}},
    //{RESISTOR_DIVIDER, "Stretch10", A10},
    //{RESISTOR_DIVIDER, "Stretch11", A11}
    //{FLEX, "test1", A2},
    //{FLEX, "test2", A3},
    //{FLEX, "test3", A4},
    //{FLEX, "test4", A5}
};

//Auto-ranging + smoothing
void filter_value(int raw, FilteredValue* f) {
    if (raw < f->raw_min) {f->raw_min = raw;}
    if (raw > f->raw_max) {f->raw_max = raw;}

    //exponential smoothing
    //Wikipedia <3
    f->filtered = SMOOTH_FACTOR*raw + (1 - SMOOTH_FACTOR)*f->filtered;

    f->out = map(round(f->filtered), f->raw_min, f->raw_max, 0, 1000);
    if (f->invert) {f->out = 1000 - f->out;}
}

void sensors_init() {
    for (int i=0; i < NUM_SENSORS; i++) {
        sensor_init(&sensorList[i]);
    }
}

void sensors_update() {
    //Measure & filter
    if ((millis() - lastSensorsUpdate) > SENSOR_MEASURE_INTERVAL) {
        for (int i=0; i < NUM_SENSORS; i++) {
            sensor_update(&sensorList[i]);
        }
        lastSensorsUpdate = millis();
    }
    //Send filtered data
    if ((millis() - lastDataDump) > SENSOR_UPDATE_INTERVAL) {
        send_sensor_data();
        //send_configuration();
        lastDataDump = millis();
        ledBlink = !ledBlink;
        //digitalWrite(11, ledBlink);
    }
}

void sensor_init(Sensor *s) {
    pinMode(s->pin, INPUT);
    s->value.filtered = 0.0;
    s->value.raw_min = 1023;
    s->value.raw_max = 0;
}

//Measure
void sensor_update(Sensor *s) {
    if (s->pin < 0) { //undefined pin
        return;
    }
    float reading = 0;
    if (s->type == RESISTOR_DIVIDER) {
        reading = analogRead(s->pin);
    }

    filter_value(reading, &s->value);
}
