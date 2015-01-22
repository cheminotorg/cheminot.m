package m.cheminot.plugin.jni;


public class CheminotLib {

  static {
    System.loadLibrary("cheminot");
  }

  public static native String init(String dbPath, String graphPath, String calendarDatesPath);

  public static native String lookForBestTrip(String veId, String vsId, int at, int te, int max);
}
