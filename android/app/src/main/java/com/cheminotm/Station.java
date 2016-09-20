package com.cheminotm;

import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;

class Station {

    private String id;
    private String name;

    public Station(String id, String name) {
        this.id = id;
        this.name = name;
    }

    public String getId() {
        return this.id;
    }

    public String getName() {
        return this.name;
    }

    public static WritableMap toWritableMap(Station station) {
        WritableNativeMap map = new WritableNativeMap();
        map.putString("id", station.getId());
        map.putString("name", station.getName());
        return map;
    }

    public static WritableArray toWritableArray(List<? extends Station> stations) {
        WritableNativeArray array = new WritableNativeArray();
        for(Station station : stations) {
            array.pushMap(toWritableMap(station));
        }
        return array;
    }
}
