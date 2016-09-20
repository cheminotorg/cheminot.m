package com.cheminotm;

import android.app.Activity;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;

class Database {

    private SQLiteDatabase db;

    public Database(File dbFile) {
        db = SQLiteDatabase.openDatabase(dbFile.getAbsolutePath(), null, SQLiteDatabase.OPEN_READWRITE);
    }

    public List<Station> matchesStations(String term, Integer limit) {
        Cursor cursor = db.query(true, "stationfts", null, "name MATCH ?", new String[]{"^" + term + "*"}, null, null, "name", limit.toString());
        ArrayList<Station> stations = new ArrayList<Station>();
        cursor.moveToFirst();
        while (!cursor.isAfterLast()) {
            String id = cursor.getString(0);
            String name = cursor.getString(1);
            stations.add(new Station(id, name));
            cursor.moveToNext();
        }
        cursor.close();
        return stations;
    }

    public List<LocatedStation> nearestStations(Double lat, Double lng, Double radius, Integer limit) {
        final double mult = 1.1;
        Position pos = new Position(lat, lng);

        Position p1 = Position.calculateDerivedPosition(pos, mult * radius, 0);
        Position p2 = Position.calculateDerivedPosition(pos, mult * radius, 90);
        Position p3 = Position.calculateDerivedPosition(pos, mult * radius, 180);
        Position p4 = Position.calculateDerivedPosition(pos, mult * radius, 270);

        String whereClause = "lat > ? AND lat < ? AND lng < ? AND lng > ?";
        String[] whereValues = new String[]{
            String.valueOf(p3.getLat()),
            String.valueOf(p1.getLat()),
            String.valueOf(p2.getLng()),
            String.valueOf(p4.getLng())
        };

        Cursor cursor = db.query(true, "station", null, whereClause, whereValues, null, null, null, limit.toString());

        List<LocatedStation> nearestStations = new ArrayList<LocatedStation>();
        cursor.moveToFirst();
        while (!cursor.isAfterLast()) {
            String stationId = cursor.getString(0);
            String stationName = cursor.getString(1);
            Double stationLat = cursor.getDouble(3);
            Double stationLng = cursor.getDouble(4);
            nearestStations.add(new LocatedStation(stationId, stationName, new Position(stationLat, stationLng)));
            cursor.moveToNext();
        }
        cursor.close();
        LocatedStation.sortByDistance(pos, nearestStations);

        return nearestStations;
    }

    public static Database setup(Activity activity) throws IOException {
        File dbFile = Database.copyFromAssets(activity, "cheminot.db", 1024, true);
        return new Database(dbFile);
    }

    private static File copyFromAssets(Activity activity, String file, int bufsize, boolean force) throws IOException {
        File dbFile = activity.getDatabasePath(file);
        dbFile.getParentFile().mkdirs();
        if (!dbFile.exists() || force) {
            if(dbFile.exists() && force) {
                android.util.Log.i("Cheminot", "Force update of " + file);
                dbFile.delete();
            }
            InputStream in = activity.getApplicationContext().getAssets().open(file);
            OutputStream out = new FileOutputStream(dbFile);
            byte[] buf = new byte[bufsize];
            int len;
            while ((len = in.read(buf)) > 0) {
                out.write(buf, 0, len);
            }
            in.close();
            out.close();
        } else {
            android.util.Log.i("Cheminot", "No update for " + file);
        }
        return activity.getDatabasePath(file);
    }
}
