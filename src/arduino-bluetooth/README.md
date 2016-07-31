Firmware for Futuwear sensor measurement and bluetooth communication.

Reads analog inputs, and reports filtered values in JSON format over a bluetooth link.

Hardware:
* ATMega32u4 @ 16MHz + Arduino Leonardo bootloader
* Bluegiga WT11-A Bluetooth module

Developed using Arduino libraries. Compile using the Arduino IDE.

Library dependencies:
* [iWRAP](https://github.com/jrowberg/iwrap)
* [AltSoftSerial](https://github.com/PaulStoffregen/AltSoftSerial) This library is not even used! 
* [ArduinoJson](https://github.com/bblanchon/ArduinoJson)
* TrueRandom

Features:
* Simple noise reduction through software filtering
* Automatic UUID and security code generation (currently disabled)

Each outgoing data packet is a single line containing a JSON object.

