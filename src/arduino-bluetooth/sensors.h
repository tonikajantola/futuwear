#ifndef SENSORS_H
#define SENSORS_H

#include <Arduino.h>

//Global measurement smoothing factor
#define SMOOTH_FACTOR 0.05f
#define NUM_SENSORS 2
#define SENSOR_UPDATE_INTERVAL 500 //milliseconds


typedef enum {
    FLEX,
    ECG,
    FORCE,
    STRETCH
} sensor_class;

typedef struct Sensor {
    sensor_class    type; //sensor type
    const char      *name;
    int             pin; //physical pin

    int             raw_min;
    int             raw_max;
    float           filteredValue;
    int             outValue;
};

//List of connected sensors defined in sensors.cpp
extern Sensor sensorList[NUM_SENSORS];

void sensors_init();
void sensors_update();

void sensor_init(Sensor *s);
void sensor_update(Sensor *s);

#endif // SENSORS_H
