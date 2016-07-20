#ifndef SENSORS_H
#define SENSORS_H

#include <Arduino.h>

//Global measurement smoothing factor
#define SMOOTH_FACTOR 0.03f
#define NUM_SENSORS 6
#define SENSOR_MEASURE_INTERVAL 2
#define SENSOR_UPDATE_INTERVAL 50  //milliseconds

typedef enum {
    RESISTOR_DIVIDER
} sensor_class;

typedef struct FilteredValue {
    int             raw_min;
    int             raw_max;
    float           filtered;
    int             out;
};

typedef struct Sensor {
    sensor_class    type; //sensor type
    const char      *name;
    int             pin; //physical pin

    FilteredValue value;
};

//List of connected sensors defined in sensors.cpp
extern Sensor sensorList[NUM_SENSORS];

void filter_value(int raw, FilteredValue* f);

void sensors_init();
void sensors_update();

void sensor_init(Sensor *s);
void sensor_update(Sensor *s);

#endif // SENSORS_H
