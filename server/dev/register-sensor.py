import json, requests

def registerSensor(name, uuid, pin):
	url = 'http://futuwear.tunk.org/register/'
	payload = {"name": name, "uuid": uuid, "pin": pin}
	resp = requests.get(url, data=payload)
	data = json.loads(resp.text)
	status = data['error']
	if not status:
		status = "Registration successful"
	return status



print(registerSensor("test-device", "9c1411ea-7317-48fb-8918-7845bda87441", "1234"))