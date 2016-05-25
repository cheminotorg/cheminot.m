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
        ArrayList<Station> stations = new ArrayList<Station>();
        Cursor cursor = db.query(true, "stationfts", null, "name MATCH ?", new String[]{"^" + term + "*"}, null, null, "name", limit.toString());
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
