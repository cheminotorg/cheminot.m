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
    unknown, init, lookForBestTrip
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

    default:
      cbc.error("Unknown action: " + action);
    }

    return true;
  }

  private void init(CallbackContext cbc) {
    String database = "cheminot.db";
    try {
      this.prepareDatabase(database);
      String dbpath = this.cordova.getActivity().getDatabasePath(database).getAbsolutePath();
      cbc.success(CheminotLib.init(dbpath));
    } catch (IOException e) {
      cbc.error(e.getMessage());
    }
  }

  private void prepareDatabase(String database) throws IOException {
    Activity activity = this.cordova.getActivity();
    File dbFile = activity.getDatabasePath(database);
    if(!dbFile.exists()){
      File dbDirectory = new File(dbFile.getParent());
      dbDirectory.mkdirs();
      InputStream in = activity.getApplicationContext().getAssets().open(database);
      OutputStream out = new FileOutputStream(dbFile);
      byte[] buf = new byte[1024];
      int len;
      while ((len = in.read(buf)) > 0) {
        out.write(buf, 0, len);
      }
      in.close();
      out.close();
    }
  }

  private void lookForBestTrip(JSONArray args, CallbackContext cbc) {
    try {
      String vsId = args.getString(0);
      String veId = args.getString(1);
      int at = args.getInt(2);
      cbc.success(CheminotLib.lookForBestTrip(vsId, veId, at));
    } catch (JSONException e) {
      cbc.error(e.getMessage());
    }
  }
}
