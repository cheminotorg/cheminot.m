package m.cheminot.plugin.jni;

public class CheminotLib {

    static {
        System.loadLibrary("cheminot");
    }

    public static native String f(String dbpath);
}
