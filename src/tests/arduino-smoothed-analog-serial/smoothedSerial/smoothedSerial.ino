/*
  AnalogReadSerial
  Reads an analog input on pin 0, prints the result to the serial monitor.
  Graphical representation is available using serial plotter (Tools > Serial Plotter menu)
  Attach the center pin of a potentiometer to pin A0, and the outside pins to +5V and ground.

  This example code is in the public domain.
*/

int minV = 1023;
int maxV = 0;
float smoothedValue = 0.0;
float smoothingWeight = 0.004;
unsigned long lastOut = 0;

// the setup routine runs once when you press reset:
void setup() {
  // initialize serial communication at 9600 bits per second:
  Serial.begin(115200);
  lastOut = millis();
}

// the loop routine runs over and over again forever:
void loop() {
  // read the input on analog pin 0:
  int sensorValue = analogRead(A0);
  if (sensorValue > maxV) {maxV = sensorValue;}
  if (sensorValue < minV) {minV = sensorValue;}
  sensorValue = map(sensorValue, minV, maxV, 0, 1000);
  smoothedValue = smoothingWeight*sensorValue + (1 - smoothingWeight)*smoothedValue;
  
  // print out the value you read:
  //Serial.println();
  if ((millis() - lastOut) > 200) {
    Serial.println(smoothedValue);
    lastOut = millis();
  }
  delay(10);        // delay in between reads for stability
}
