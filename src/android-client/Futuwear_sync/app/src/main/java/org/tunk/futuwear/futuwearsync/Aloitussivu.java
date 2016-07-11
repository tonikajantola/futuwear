package org.tunk.futuwear.futuwearsync;

import android.bluetooth.BluetoothAdapter;
import android.content.Intent;
import android.graphics.Color;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.widget.TextView;

public class Aloitussivu extends AppCompatActivity {

    boolean DEBUG = true;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_aloitussivu);
    }


    protected void onResume() {
        super.onResume();

        setContentView(R.layout.activity_aloitussivu);

        TextView status = (TextView) findViewById(R.id.statusText);

        status.setTextColor(Color.BLACK);

        if (DEBUG) {
            status.setText("Initialized (onResume)");
        }

        BluetoothAdapter mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();

        if (!mBluetoothAdapter.isEnabled()) {
            Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            startActivityForResult(enableBtIntent, 3);
        }

    }

}
