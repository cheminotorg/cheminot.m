package m.cheminot.plugin.jni;

public class CheminotLib {

  static {
    System.loadLibrary("cheminot");
  }

  public static native String init(String dbpath);

  public static native String lookForBestTrip(String veId, String vsId, int at);
}
