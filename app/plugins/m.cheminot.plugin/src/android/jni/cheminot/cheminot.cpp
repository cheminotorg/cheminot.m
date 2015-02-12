#include <jni.h>
#include <android/log.h>
#include <string>
#include <map>
#include <list>
#include <memory>
#include <sqlite3.h>
#include <ctime>
#include <cheminotc.h>

#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG,"Cheminot", __VA_ARGS__)

static cheminotc::Graph graph;
static cheminotc::CalendarDates calendarDates;
static sqlite3* connection = NULL;

//Cache
static cheminotc::VerticesCache verticesCache;
static cheminotc::TripsCache tripsCache;
static cheminotc::CalendarDatesCache calendarDatesCache;

extern "C" {
  JNIEXPORT jstring JNICALL Java_m_cheminot_plugin_jni_CheminotLib_init(JNIEnv *env, jclass clazz, jstring jdbPath, jstring jgraphPath, jstring jcalendarDatesPath);
  JNIEXPORT jstring JNICALL Java_m_cheminot_plugin_jni_CheminotLib_lookForBestTrip(JNIEnv *env, jclass clazz, jstring jvsId, jstring jveId, jint jat, jint jte, jint jmax);
  JNIEXPORT jstring JNICALL Java_m_cheminot_plugin_jni_CheminotLib_lookForBestDirectTrip(JNIEnv *env, jclass clazz, jstring jvsId, jstring jveId, jint jat, jint jte);
  JNIEXPORT void JNICALL Java_m_cheminot_plugin_jni_CheminotLib_abort(JNIEnv *env, jclass clazz);
};

JNIEXPORT jstring JNICALL Java_m_cheminot_plugin_jni_CheminotLib_init(JNIEnv *env, jclass clazz, jstring jdbPath, jstring jgraphPath, jstring jcalendarDatesPath) {
  const char *dbPath = env->GetStringUTFChars(jdbPath, (jboolean *)0);
  const char *graphPath = env->GetStringUTFChars(jgraphPath, (jboolean *)0);
  const char *calendarDatesPath = env->GetStringUTFChars(jcalendarDatesPath, (jboolean *)0);

  connection = cheminotc::openConnection(dbPath);
  Json::Value meta = cheminotc::getMeta(connection);

  if(calendarDates.empty()) {
    cheminotc::parseCalendarDates(calendarDatesPath, &calendarDates);
  }

  if(graph.empty()) {
    cheminotc::parseGraph(graphPath, &graph);
  }

  env->ReleaseStringUTFChars(jdbPath, dbPath);
  env->ReleaseStringUTFChars(jgraphPath, graphPath);
  env->ReleaseStringUTFChars(jcalendarDatesPath, calendarDatesPath);

  Json::FastWriter* writer = new Json::FastWriter();
  return env->NewStringUTF(writer->write(meta).c_str());
}

JNIEXPORT jstring JNICALL Java_m_cheminot_plugin_jni_CheminotLib_lookForBestTrip(JNIEnv *env, jclass clazz, jstring jvsId, jstring jveId, jint jat, jint jte, jint jmax) {
  const char* vsId = env->GetStringUTFChars(jvsId, (jboolean *)0);
  const char* veId = env->GetStringUTFChars(jveId, (jboolean *)0);
  tm at = cheminotc::asDateTime((int)jat);
  tm te = cheminotc::asDateTime((int)jte);
  int max = (int)jmax;

  long unsigned int a = graph.size();
  long unsigned int b = calendarDates.size();
  LOGD("###> lookForBestTrip %s %s %s %s", vsId, veId, cheminotc::formatDateTime(at).c_str(), cheminotc::formatDateTime(te).c_str());

  cheminotc::unlock(connection);
  auto result = cheminotc::lookForBestTrip(connection, &graph, &tripsCache, &verticesCache, &calendarDates, &calendarDatesCache, vsId, veId, at, te, max);
  std::list<cheminotc::ArrivalTime> arrivalTimes = result.second;
  bool locked = result.first;

  long unsigned int c = arrivalTimes.size();
  LOGD("######> DONE %lu", c);

  env->ReleaseStringUTFChars(jvsId, vsId);
  env->ReleaseStringUTFChars(jveId, veId);

  if(!locked) {
    Json::Value serialized = cheminotc::serializeArrivalTimes(&graph, &verticesCache, arrivalTimes);
    Json::FastWriter* writer = new Json::FastWriter();
    return env->NewStringUTF(writer->write(serialized).c_str());
  } else {
    return env->NewStringUTF("null");
  }
}

JNIEXPORT jstring JNICALL Java_m_cheminot_plugin_jni_CheminotLib_lookForBestDirectTrip(JNIEnv *env, jclass clazz, jstring jvsId, jstring jveId, jint jat, jint jte) {
  const char* vsId = env->GetStringUTFChars(jvsId, (jboolean *)0);
  const char* veId = env->GetStringUTFChars(jveId, (jboolean *)0);
  tm at = cheminotc::asDateTime((int)jat);
  tm te = cheminotc::asDateTime((int)jte);

  long unsigned int a = graph.size();
  long unsigned int b = calendarDates.size();
  LOGD("###> lookForBestDirectTrip %s %s %s %s", vsId, veId, cheminotc::formatDateTime(at).c_str(), cheminotc::formatDateTime(te).c_str());

  cheminotc::unlock(connection);
  std::pair<bool, std::list<cheminotc::ArrivalTime>> result = lookForBestDirectTrip(connection, &graph, &verticesCache, &tripsCache, &calendarDates, &calendarDatesCache, vsId, veId, at, te);
  std::list<cheminotc::ArrivalTime> arrivalTimes = result.second;

  long unsigned int c = arrivalTimes.size();
  LOGD("######> DONE %lu", c);

  env->ReleaseStringUTFChars(jvsId, vsId);
  env->ReleaseStringUTFChars(jveId, veId);

  Json::Value serialized = cheminotc::serializeArrivalTimes(&graph, &verticesCache, arrivalTimes);
  Json::Value json;
  json["arrivalTimes"] = serialized;
  json["hasDirect"] = result.first;
  Json::FastWriter* writer = new Json::FastWriter();
  return env->NewStringUTF(writer->write(json).c_str());
}

JNIEXPORT void JNICALL Java_m_cheminot_plugin_jni_CheminotLib_abort(JNIEnv *env, jclass clazz) {
  cheminotc::lock(connection);
  LOGD("ABORTED");
}
