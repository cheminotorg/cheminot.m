package m.cheminot.plugin;

import m.cheminot.plugin.jni.CheminotLib;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;

public class Cheminot extends CordovaPlugin {

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext cbc) {
        String dbpath = this.cordova.getActivity().getDatabasePath("cheminot.db").getAbsolutePath();
        cbc.success(CheminotLib.f(dbpath));
        return true;
    }
}
