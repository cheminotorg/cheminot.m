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
static cheminotc::Tracker tracker = { false };
static sqlite3* connection = NULL;

//Cache
static cheminotc::VerticesCache verticesCache;
static cheminotc::TripsCache tripsCache;
static cheminotc::CalendarDatesCache calendarDatesCache;

extern "C" {
  JNIEXPORT jstring JNICALL Java_m_cheminot_plugin_jni_CheminotLib_init(JNIEnv *env, jclass clazz, jstring jdbPath, jstring jgraphPath, jstring jcalendarDatesPath);
  JNIEXPORT jstring JNICALL Java_m_cheminot_plugin_jni_CheminotLib_lookForBestTrip(JNIEnv *env, jclass clazz, jstring jvsId, jstring jveId, jint jat, jint jte, jint jmax);
};

JNIEXPORT jstring JNICALL Java_m_cheminot_plugin_jni_CheminotLib_init(JNIEnv *env, jclass clazz, jstring jdbPath, jstring jgraphPath, jstring jcalendarDatesPath) {
  const char *dbPath = env->GetStringUTFChars(jdbPath, (jboolean *)0);
  const char *graphPath = env->GetStringUTFChars(jgraphPath, (jboolean *)0);
  const char *calendarDatesPath = env->GetStringUTFChars(jcalendarDatesPath, (jboolean *)0);

  connection = cheminotc::openConnection(dbPath);
  std::string result = cheminotc::getVersion(connection);

  if(calendarDates.empty()) {
    cheminotc::parseCalendarDates(calendarDatesPath, &calendarDates);
  }

  if(graph.empty()) {
    cheminotc::parseGraph(graphPath, &graph);
  }

  env->ReleaseStringUTFChars(jdbPath, dbPath);
  env->ReleaseStringUTFChars(jgraphPath, graphPath);
  env->ReleaseStringUTFChars(jcalendarDatesPath, calendarDatesPath);

  return env->NewStringUTF(result.c_str());
}

JNIEXPORT jstring JNICALL Java_m_cheminot_plugin_jni_CheminotLib_lookForBestTrip(JNIEnv *env, jclass clazz, jstring jvsId, jstring jveId, jint jat, jint jte, jint jmax) {
  const char* vsId = env->GetStringUTFChars(jvsId, (jboolean *)0);
  const char* veId = env->GetStringUTFChars(jveId, (jboolean *)0);
  tm at = cheminotc::asDateTime((int)jat);
  tm te = cheminotc::asDateTime((int)jte);
  int max = (int)jmax;

  long unsigned int a = graph.size();
  long unsigned int b = calendarDates.size();

  LOGD("GRAPH %lu", a);
  LOGD("CALENDAR %lu", b);
  LOGD("###> lookForBestTrip %s %s %s %s", vsId, veId, cheminotc::formatDateTime(at).c_str(), cheminotc::formatDateTime(te).c_str());

  std::list<cheminotc::ArrivalTime> arrivalTimes = cheminotc::lookForBestTrip(&tracker, connection, &graph, &tripsCache, &verticesCache, &calendarDates, &calendarDatesCache, vsId, veId, at, te, max);

  long unsigned int c = arrivalTimes.size();
  LOGD("######> DONE %lu", c);

  Json::Value serialized = cheminotc::serializeArrivalTimes(&graph, &verticesCache, arrivalTimes);
  Json::FastWriter* writer = new Json::FastWriter();

  env->ReleaseStringUTFChars(jvsId, vsId);
  env->ReleaseStringUTFChars(jveId, veId);

  return env->NewStringUTF(writer->write(serialized).c_str());
}
