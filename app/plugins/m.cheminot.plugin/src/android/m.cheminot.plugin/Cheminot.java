package m.cheminot.plugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import m.cheminot.plugin.jni.CheminotLib;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

import android.app.Activity;
import android.content.res.AssetManager;
import android.content.res.Resources;
import android.util.Log;

public class Cheminot extends CordovaPlugin {

  enum CheminotAction {
    unknown, init, lookForBestTrip, lookForBestDirectTrip, abort
  }

  static class CheminotDB {
    private String db;
    private String graph;
    private String calendarDates;
    private Date date;

    static Pattern pattern = Pattern.compile("(\\w+)-(\\d+)(\\.db)?");
    static SimpleDateFormat format = new SimpleDateFormat("yyyyMMddHHmmss", Locale.FRANCE);

    public CheminotDB() {
    }

    public boolean isValid() {
      return this.db != null && this.graph != null && this.calendarDates != null;
    }

    public boolean isMoreRecent(CheminotDB other) {
      return this.date.getTime() > other.getDate().getTime();
    }

    public String getDb() {
      return this.db;
    }

    public String getGraph() {
      return this.graph;
    }

    public String getCalendarDates() {
      return this.calendarDates;
    }

   public Date getDate() {
      return this.date;
    }

    public void setDb(String db) {
      this.db = db;
    }

    public void setGraph(String graph) {
      this.graph = graph;
    }

    public void setCalendarDates(String calendarDates) {
      this.calendarDates = calendarDates;
    }

    public void setDate(Date date) {
      this.date = date;
    }
  }

  @Override
  public boolean execute(String action, JSONArray args, CallbackContext cbc) {

    CheminotAction name = CheminotAction.unknown;
    try {
      name = CheminotAction.valueOf(action);
    } catch (IllegalArgumentException e) {}

    switch(name) {

    case init:
      this.init(cbc);
      break;

    case lookForBestTrip:
      this.lookForBestTrip(args, cbc);
      break;

    case lookForBestDirectTrip:
      this.lookForBestDirectTrip(args, cbc);
      break;

    case abort:
      this.abort(cbc);
      break;

    default:
      cbc.error("Unknown action: " + action);
    }

    return true;
  }

  private void init(final CallbackContext cbc) {
    final Activity activity = this.cordova.getActivity();
      this.cordova.getThreadPool().execute(new Runnable() {
        public void run() {
          try {
            final CheminotDB cheminotDB = getMostRecentDB(activity);
            if(cheminotDB != null) {
              File dbFile = copyFromAssets(activity, cheminotDB.getDb(), 4096);
              File graphFile = copyFromAssets(activity, cheminotDB.getGraph(), 4096);
              File calendarDatesFile = copyFromAssets(activity, cheminotDB.getCalendarDates(), 1024);
              cleanDbDirectory(new File(dbFile.getParent()), cheminotDB);
              cbc.success(CheminotLib.init(dbFile.getAbsolutePath(), graphFile.getAbsolutePath(), calendarDatesFile.getAbsolutePath()));
            } else {
              cbc.error("Unable to find the most recent db");
            }
          } catch (IOException e) {
            cbc.error(e.getMessage());
          }
        }
      });
  }

  private static File copyFromAssets(Activity activity, String file, int bufsize) throws IOException {
    File dbFile = activity.getDatabasePath(file);
    if(!dbFile.exists()) {
      File dbDirectory = new File(dbFile.getParent());
      dbDirectory.mkdirs();
      InputStream in = activity.getApplicationContext().getAssets().open(file);
      OutputStream out = new FileOutputStream(dbFile);
      byte[] buf = new byte[bufsize];
      int len;
      while ((len = in.read(buf)) > 0) {
        out.write(buf, 0, len);
      }
      in.close();
      out.close();
    }
    return activity.getDatabasePath(file);
  }

  private static void cleanDbDirectory(File dbDir, CheminotDB cheminotDB) {
    for(String name : dbDir.list()) {
      File file = new File(dbDir.getAbsolutePath() + "/" + name);
      Matcher matcher = CheminotDB.pattern.matcher(name);
      if(matcher.matches()) {
        String version = matcher.group(2);
        try {
          Date date = CheminotDB.format.parse(version);
          if(date.getTime() < cheminotDB.getDate().getTime()) {
            file.delete();
          }
        } catch (ParseException e) {
          file.delete();
        }
      } else {
        file.delete();
      }
    }
  }

  private static CheminotDB getMostRecentDB(Activity activity) {
    Resources ressources = activity.getResources();
    AssetManager assetManager = ressources.getAssets();
    CheminotDB mostRecentDB = null;

    try {
      String[] files = assetManager.list("");

      Map<String, CheminotDB> dbByVersion = new HashMap<String, CheminotDB>();
      for(String file : files) {
        Matcher matcher = CheminotDB.pattern.matcher(file);
        if(matcher.matches()) {
          String name = matcher.group(1);
          String version = matcher.group(2);
          try {
            Date date = CheminotDB.format.parse(version);
            if(dbByVersion.get(version) == null) {
              dbByVersion.put(version, new CheminotDB());
            }
            CheminotDB cheminotDB = dbByVersion.get(version);
            cheminotDB.setDate(date);
            if(name.equals("cheminot")) {
              cheminotDB.setDb(file);
            } else if(name.equals("graph")) {
              cheminotDB.setGraph(file);
            } else if(name.equals("calendardates")) {
              cheminotDB.setCalendarDates(file);
            }
          } catch (ParseException e) {}
        }
      }

      for(CheminotDB cheminotDB : dbByVersion.values()) {
        if(mostRecentDB == null || cheminotDB.isMoreRecent(mostRecentDB)) {
          if(cheminotDB.isValid()) {
            mostRecentDB = cheminotDB;
          }
        }
      }
    } catch (IOException e) {}

    return mostRecentDB;
  }

  private void lookForBestTrip(final JSONArray args, final CallbackContext cbc) {
      this.cordova.getThreadPool().execute(new Runnable() {
          public void run() {
            try {
              String vsId = args.getString(0);
              String veId = args.getString(1);
              int at = args.getInt(2);
              int te = args.getInt(3);
              int max = args.getInt(4);
              cbc.success(CheminotLib.lookForBestTrip(vsId, veId, at, te, max));
            } catch (JSONException e) {
              cbc.error("Unable to perform `lookForBestTrip`: " + e.getMessage());
            }
          }
      });
  }

  private void lookForBestDirectTrip(final JSONArray args, final CallbackContext cbc) {
      this.cordova.getThreadPool().execute(new Runnable() {
          public void run() {
            try {
              String vsId = args.getString(0);
              String veId = args.getString(1);
              int at = args.getInt(2);
              int te = args.getInt(3);
              cbc.success(CheminotLib.lookForBestDirectTrip(vsId, veId, at, te));
            } catch (JSONException e) {
              cbc.error("Unable to perform `lookForBestDirectTrip`: " + e.getMessage());
            }
          }
      });
  }

  private void abort(final CallbackContext cbc) {
    this.cordova.getThreadPool().execute(new Runnable() {
      public void run() {
        CheminotLib.abort();
        cbc.success();
      }
    });
  }
}
