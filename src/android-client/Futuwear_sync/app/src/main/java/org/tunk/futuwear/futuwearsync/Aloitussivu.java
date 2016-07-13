package org.tunk.futuwear.futuwearsync;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import java.io.IOException;
import java.math.BigInteger;
import java.util.Set;
import java.util.UUID;
public class Aloitussivu extends AppCompatActivity {
    private String sppUuid = ("0000110100001000800000805F9B34FB");
    private UUID spdUuid = new UUID(
            new BigInteger(sppUuid.substring(0, 16), 16).longValue(),
            new BigInteger(sppUuid.substring(16), 16).longValue());
    private TextView console;
    private TextView macAddress;
    private Button connectButton;
    private BluetoothAdapter bluetoothAdapter;
    private BluetoothDevice remoteDevice;
    private BluetoothSocket rfcommSocket;
    private String remoteMac = "78:1F:DB:D4:BC:A2";
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_aloitussivu);
        console = (TextView) findViewById(R.id.statusText);
        bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        macAddress = (EditText) findViewById(R.id.macAddress);
        macAddress.setText(remoteMac);
        connectButton = (Button) findViewById(R.id.connectButton);
        connectButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                console.append("\nConnecting to: " + macAddress.getText().toString());
                connect();
            }
        });
    }
    @Override
    protected void onResume() {
        super.onResume();
        //checkBluetoothState();
        //getPairedDevices();
    }
    void getPairedDevices() {
        Set<BluetoothDevice> pairedDevices = bluetoothAdapter.getBondedDevices();
        if (pairedDevices.size() > 0) {
            console.append("\nPaired devices:");
            for (BluetoothDevice device : pairedDevices) {
                console.append("\n   " + device.getName() + " (" + device.getAddress() + ")");
            }
        } else {
            console.append("\nERROR: No paired devices found! Please pair your shirt with this device.");
        }
    }
    void checkBluetoothState() {
        if (!bluetoothAdapter.isEnabled()) {
            Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            startActivityForResult(enableBtIntent, 3);
        }
        if (bluetoothAdapter == null) {
            console.setText("ERROR: Bluetooth disabled!");
        }
        console.setText("Our Bluetooth address: " + bluetoothAdapter.getAddress());
    }
    void connect() {
        console.append("\nConnecting to: "+remoteMac);
        remoteDevice = bluetoothAdapter.getRemoteDevice(remoteMac);
        try {
            rfcommSocket = remoteDevice.createRfcommSocketToServiceRecord(spdUuid);
            console.append("\nServer socket created succesfully");
        } catch (IOException e) {
            console.append("\nERROR: IOException with mBluetoothAdapter.listenUsingRfcommWithServiceRecord(SPDname, SPDuuid)!");
        }
    }
}
