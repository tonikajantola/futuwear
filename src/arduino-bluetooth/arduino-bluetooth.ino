#include "iwrapper.h"
#include "sensors.h"
#include "communication.h"
//#include <MemoryFree.h>


void setup() {
    sensors_init();
    iwrapper_setup();
    communication_init();
}

void loop() {
  iwrapper_loop();
  sensors_update();
}
