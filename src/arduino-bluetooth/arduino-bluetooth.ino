#include "iwrapper.h"
#include "sensors.h"
#include "communication.h"


void setup() {
    sensors_init();
    iwrapper_setup();
    communication_init();
}

void loop() {
  iwrapper_loop();
  sensors_update();
}
