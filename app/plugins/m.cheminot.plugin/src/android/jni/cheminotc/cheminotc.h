#include <sqlite3.h>
#include <map>
#include <list>
#include <memory>
#include "protobuf/cheminotBuf.pb.h"
#include <json/json.h>

namespace cheminotc {

  typedef google::protobuf::Map< std::string,m::cheminot::data::Vertice> Graph;
  typedef google::protobuf::Map<std::string,m::cheminot::data::CalendarExceptions> CalendarDates;

  struct StopTime {
    std::string tripId;
    tm arrival;
    tm departure;
    int pos;
  };

  struct Vertice {
    std::string id;
    std::string name;
    std::list<std::string> edges;
    std::list<StopTime> stopTimes;
  };

  struct ArrivalTime {
    std::string stopId;
    tm arrival;
    tm departure;
    std::string tripId;
    int pos;
  };

  struct CalendarDate {
    std::string serviceId;
    tm date;
    int exceptionType;
  };

  struct Calendar {
    std::string serviceId;
    std::unordered_map<std::string, bool> week;
    tm startDate;
    tm endDate;
  };

  struct Trip {
    std::string id;
    std::unique_ptr<Calendar> calendar;
    std::string direction;
    std::list<std::string> stopIds;
  };

  typedef std::map<time_t, ArrivalTime> ArrivalTimeFunc; //TODO unordered_map

  typedef std::unordered_map<std::string, ArrivalTimeFunc> ArrivalTimesFunc;

  typedef std::unordered_map<std::string, std::shared_ptr<Vertice>> VerticesCache;

  typedef std::unordered_map<std::string, std::list<std::shared_ptr<CalendarDate>>> CalendarDatesCache;

  typedef std::unordered_map<std::string, std::shared_ptr<Trip>> TripsCache;

  struct Cache {
    VerticesCache vertices;
    CalendarDatesCache calendarDates;
    TripsCache trips;
  };

  tm getNow();

  sqlite3* openConnection(std::string path);

  std::string getVersion(sqlite3 *handle);

  void lock(sqlite3 *handle);

  void unlock(sqlite3 *handle);

  bool isLocked(sqlite3 *handle);

  void parseGraph(std::string path, Graph *graph);

  void parseCalendarDates(std::string content, CalendarDates *calendarDates);

  std::pair<bool, ArrivalTimesFunc> refineArrivalTimes(sqlite3 *handle, Graph *graph, Cache *cache, CalendarDates *calendarDates, std::string vsId, std::string veId, tm ts, tm te, int maxStartingTimes);

  std::pair<bool, std::list<ArrivalTime>> lookForBestDirectTrip(sqlite3 *handle, Graph *graph, Cache *cache, CalendarDates *calendarDates, std::string vsId, std::string veId, tm ts, tm te);

  std::pair<bool, std::list<ArrivalTime>> lookForBestTrip(sqlite3 *handle, Graph *graph, Cache *cache, CalendarDates *calendarDates, std::string vsId, std::string veId, tm ts, tm te, int maxStartingTimes);

  bool hasSameDateTime(const tm &a, const tm &b);

  bool datetimeIsBeforeEq(const tm &a, const tm &b);

  bool dateIsBeforeEq(const tm &a, const tm &b);

  bool timeIsBeforeEq(const tm &a, const tm &b);

  bool datetimeIsBeforeNotEq(const tm &a, const tm &b);

  std::string formatTime(tm time);

  std::string formatDate(tm time);

  std::string formatDateTime(tm datetime);

  tm asDateTime(time_t t);

  tm addMinutes(tm datetime, int n);

  tm addHours(tm datetime, int n);

  Json::Value serializeArrivalTimes(Graph *graph, Cache *cache, std::list<ArrivalTime> arrivalTimes);

  Vertice getVerticeFromGraph(const tm *dateref, Graph *graph, Cache *cache, std::string id);

  Json::Value getMeta(sqlite3 *handle);
}
