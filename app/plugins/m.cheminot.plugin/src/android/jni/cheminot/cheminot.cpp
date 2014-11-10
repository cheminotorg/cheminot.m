#include <jni.h>
#include <android/log.h>
#include <string>
#include <cheminotc.h>
#include <sqlite3.h>

char *version = NULL;

extern "C" {
  JNIEXPORT jstring JNICALL Java_m_cheminot_plugin_jni_CheminotLib_f(JNIEnv *env, jobject obj, jstring dbpath);
};

JNIEXPORT jstring JNICALL Java_m_cheminot_plugin_jni_CheminotLib_f(JNIEnv *env, jobject obj, jstring dbpath) {
  const char *path = env->GetStringUTFChars(dbpath, (jboolean *)0);
  sqlite3 *handle = cheminotc::openConnection(path);
  std::string result = cheminotc::getVersion(handle);
  __android_log_print(ANDROID_LOG_DEBUG, "CheminotLog", "RESULTS %s", result.c_str());
  env->ReleaseStringUTFChars(dbpath, path);
  return env->NewStringUTF(result.c_str());
}
