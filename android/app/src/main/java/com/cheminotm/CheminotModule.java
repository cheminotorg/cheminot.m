package com.cheminotm;

import android.app.Activity;
import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;

import java.io.IOException;

public class CheminotModule extends ReactContextBaseJavaModule {

    private Database database;

    public CheminotModule(ReactApplicationContext reactContext, Activity activity) {
        super(reactContext);
        try {
            database = Database.setup(activity);
        } catch(IOException e) {
            e.printStackTrace();
            Log.e("Cheminot", "Unable to setup database: " + e.getMessage());
        }
    }

    @Override
    public String getName() {
        return "Cheminotdb";
    }

    public CheminotModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @ReactMethod
    public void searchStops(String term, Integer limit, Promise promise) {
        WritableArray stations = Station.toWritableArray(database.matchesStations(term, limit));
        promise.resolve(stations);
    }
}
