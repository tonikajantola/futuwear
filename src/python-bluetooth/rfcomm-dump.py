import bluetooth_handler as bt

try:
    bt.init()
    bt.sendData('{"request":"configuration"}')
    while True:
        bt.readData()
        while (bt.dataAvailable()):
            print(bt.nextLine())
except Exception as e:
    print("Exception:", str(e))
print("Finalizing")
bt.finish()
