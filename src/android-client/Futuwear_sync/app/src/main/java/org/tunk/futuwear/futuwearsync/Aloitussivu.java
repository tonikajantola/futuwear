package org.tunk.futuwear.futuwearsync;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.Intent;
import android.graphics.Color;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Spinner;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Set;
public class Aloitussivu extends AppCompatActivity {
    private boolean DEBUG = true;
    private TextView console;
    private TextView macAddress;
    private BluetoothAdapter mBluetoothAdapter;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_aloitussivu);
        console = (TextView) findViewById(R.id.statusText);
        macAddress = (EditText) findViewById(R.id.macAddress);
        mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        macAddress.setText("90:A4:DE:6A:66:2E"); // Eino's laptop
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
}
