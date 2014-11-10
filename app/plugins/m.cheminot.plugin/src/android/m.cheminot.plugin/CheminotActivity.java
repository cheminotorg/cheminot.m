package m.cheminot.plugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

import org.apache.cordova.CordovaActivity;

public class CheminotActivity {

    public static void prepareDatabase(CordovaActivity activity, String dbFileName) throws java.io.IOException
    {
        File dbFile = activity.getDatabasePath(dbFileName);
        if(!dbFile.exists()){
            File dbDirectory = new File(dbFile.getParent());
            dbDirectory.mkdirs();
            InputStream in = activity.getApplicationContext().getAssets().open(dbFileName);
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
}
