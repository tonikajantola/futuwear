package org.tunk.futuwear.futuwearsync;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothServerSocket;
import android.bluetooth.BluetoothSocket;
import android.content.Intent;
import android.graphics.Color;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Spinner;

import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Set;
import java.util.UUID;
public class Aloitussivu extends AppCompatActivity {
    private Integer timeout = 30000; // in milliseconds
    private UUID SPDuuid = new UUID(1337L, 1337L); // mostSigBits and leastSigBits
    private String SPDname = "FutuWearSync";
    private TextView console;
    private TextView macAddress;
    private Button connectButton;
    private BluetoothAdapter mBluetoothAdapter;
    private BluetoothServerSocket mmServerSocket;
    private BluetoothSocket bluetoothSocket;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_aloitussivu);
        console = (TextView) findViewById(R.id.statusText);
        mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        macAddress = (EditText) findViewById(R.id.macAddress);
        macAddress.setText("90:A4:DE:6A:66:2E"); // Einos laptop
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
        checkBluetoothState();
        getPairedDevices();
    }
    void getPairedDevices() {
        Set<BluetoothDevice> pairedDevices = mBluetoothAdapter.getBondedDevices();
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
        if (!mBluetoothAdapter.isEnabled()) {
            Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            startActivityForResult(enableBtIntent, 3);
        }
        if (mBluetoothAdapter == null) {
            console.setText("ERROR: Bluetooth disabled!");
        }
        console.setText("Our Bluetooth address: " + mBluetoothAdapter.getAddress());
    }
    void connect() {
        try {
            mmServerSocket = mBluetoothAdapter.listenUsingRfcommWithServiceRecord(SPDname, SPDuuid);
            console.append("\nServer socket created succesfully");
        } catch (IOException e) {
            console.append("\nERROR: IOException with mBluetoothAdapter.listenUsingRfcommWithServiceRecord(SPDname, SPDuuid)!");
        }
        console.append("\nWaiting for connection (" + timeout/1000 + "s timeout)");
        try {
            bluetoothSocket = mmServerSocket.accept(timeout);
        } catch (IOException e) {
            console.append("\nERROR: IOException with mmServerSocket.accept()!");
        }
    }
}
