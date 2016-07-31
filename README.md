Futuwear
================

Contents
----------------
* **Blender/** source files for 3D visualization in web UI
* **pcb/**:PCB design
* **server/**/: source code of server backend, web UI documents
* **src/**: source code of firmware and client

Usage
================

Server
----------------
Execute 'node run' in **/server/** to run the server.
Root will listen to POST requests containing JSON information inside variable 'data'. (helper UI available through GET). The valid JSON is timestamped and saved to **/server/sensordata/**

Client
----------------
Power on the device, and run **src/python-bluetooth/rfcomm-client.py** with python.
