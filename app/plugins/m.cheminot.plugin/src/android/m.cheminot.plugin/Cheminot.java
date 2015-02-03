package m.cheminot.plugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import m.cheminot.plugin.jni.CheminotLib;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

import android.app.Activity;

public class Cheminot extends CordovaPlugin {

  enum CheminotAction {
    unknown, init, lookForBestTrip, lookForBestDirectTrip, abort
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
            String dbPath = copyFromAssets(activity, "cheminot.db");
            String graphPath = copyFromAssets(activity, "graph");
            String calendarDatesPath = copyFromAssets(activity, "calendar_dates");
            cbc.success(CheminotLib.init(dbPath, graphPath, calendarDatesPath));
          } catch (IOException e) {
            cbc.error(e.getMessage());
          }
        }
    });
  }

  private static String copyFromAssets(Activity activity, String file) throws IOException {
    File dbFile = activity.getDatabasePath(file);
    if(!dbFile.exists()){
      File dbDirectory = new File(dbFile.getParent());
      dbDirectory.mkdirs();
      InputStream in = activity.getApplicationContext().getAssets().open(file);
      OutputStream out = new FileOutputStream(dbFile);
      byte[] buf = new byte[1024];
      int len;
      while ((len = in.read(buf)) > 0) {
        out.write(buf, 0, len);
      }
      in.close();
      out.close();
    }
    return activity.getDatabasePath(file).getAbsolutePath();
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
              cbc.error(e.getMessage());
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
              cbc.error(e.getMessage());
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
