#include <jni.h>
#include <android/log.h>
#include <string>
#include <map>
#include <list>
#include <memory>
#include <sqlite3.h>
#include <ctime>
#include <cheminotc.h>

std::map<std::string, cheminotc::Vertice> graph;
std::map<std::string, std::list<cheminotc::CalendarException> > calendarExceptions;
sqlite3* connection = NULL;

extern "C" {
  JNIEXPORT jstring JNICALL Java_m_cheminot_plugin_jni_CheminotLib_init(JNIEnv *env, jobject obj, jstring dbpath);
  JNIEXPORT jstring JNICALL Java_m_cheminot_plugin_jni_CheminotLib_lookForBestTrip(JNIEnv *env, jobject obj, jstring startId, jstring endId, jint when);
};

JNIEXPORT jstring JNICALL Java_m_cheminot_plugin_jni_CheminotLib_init(JNIEnv *env, jobject obj, jstring dbpath) {
  const char *path = env->GetStringUTFChars(dbpath, (jboolean *)0);
  connection = cheminotc::openConnection(path);
  std::string result = cheminotc::getVersion(connection);
  env->ReleaseStringUTFChars(dbpath, path);
  calendarExceptions = cheminotc::getCalendarExceptions(connection);
  graph = cheminotc::buildGraph(connection);
  __android_log_print(ANDROID_LOG_DEBUG, "CheminotLog", "GRAPH BUILT");
  return env->NewStringUTF(result.c_str());
}

JNIEXPORT jstring JNICALL Java_m_cheminot_plugin_jni_CheminotLib_lookForBestTrip(JNIEnv *env, jobject obj, jstring startId, jstring endId, jint when) {
  const char* vsId = env->GetStringUTFChars(startId, (jboolean *)0);
  const char* veId = env->GetStringUTFChars(endId, (jboolean *)0);
  struct tm at = cheminotc::asDateTime((int)when);
  std::list<cheminotc::ArrivalTime> arrivalTimes = cheminotc::lookForBestTrip(connection, &graph, &calendarExceptions, vsId, veId, at);
  Json::Value serialized = cheminotc::serializeArrivalTimes(arrivalTimes);
  Json::FastWriter* writer = new Json::FastWriter();
  return env->NewStringUTF(writer->write(&serialized).c_str());
}
