package com.cheminotm;

import android.app.Activity;
import android.util.Log;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;

import java.io.IOException;

public class CheminotModule extends ReactContextBaseJavaModule implements LifecycleEventListener {

    private Database database;

    public CheminotModule(ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addLifecycleEventListener(this);
    }

    @Override
    public String getName() {
        return "Cheminotdb";
    }

    @Override
    public void onHostResume() {
        if(this.database == null) {
            try {
                this.database = Database.setup(this.getCurrentActivity());
            } catch(IOException e) {
                e.printStackTrace();
                Log.e("Cheminot", "Unable to setup database: " + e.getMessage());
            }
        }
    }

    @Override
    public void onHostPause() {
    }

    @Override
    public void onHostDestroy() {
    }


    @ReactMethod
    public void searchStops(String term, Integer limit, Promise promise) {
        WritableArray stations = Station.toWritableArray(database.matchesStations(term, limit));
        promise.resolve(stations);
    }

    @ReactMethod
    public void nearestStops(Double lat, Double lng, Double radius, Integer limit, Promise promise) {
        WritableArray stations = Station.toWritableArray(database.nearestStations(lat, lng, radius, limit));
        promise.resolve(stations);
    }
}
