#include <stdio.h>
#include <stdlib.h>
#include <string>
#include <time.h>
#include <list>
#include <queue>
#include <numeric>
#include <algorithm>
#include <sstream>
#include <memory>
#include <sqlite3.h>
#include <json/json.h>

namespace cheminotc {

  template <typename T>
  std::string to_string(T value) {
    std::ostringstream os ;
    os << value ;
    return os.str() ;
  }

  struct StopTime {
    std::string tripId;
    struct tm arrival;
    struct tm departure;
    int pos;
  };

  struct Calendar {
    std::string serviceId;
    std::map<std::string, bool> week;
    struct tm startDate;
    struct tm endDate;
  };

  struct CalendarException {
    std::string serviceId;
    struct tm date;
    int exceptionType;
  };

  struct Trip {
    std::string id;
    std::unique_ptr<Calendar> calendar;
    std::string direction;
  };

  struct Stop {
    std::string id;
    std::string name;
    double lat;
    double lng;
  };

  struct Vertice {
    std::string id;
    std::string name;
    std::list<std::string> edges;
    std::list<StopTime> stopTimes;
  };

  struct tm getNow() {
    time_t rawtime;
    time(&rawtime);
    struct tm *info = gmtime(&rawtime);
    return *info;
  }

  std::string formatTime(struct tm time) {
    return to_string(time.tm_hour) + ":" + to_string(time.tm_min);
  }

  struct tm parseTime(std::string datetime) {
    struct tm now = getNow();
    struct tm time;
    strptime(datetime.c_str(), "%H:%M", &time);
    now.tm_hour = time.tm_hour;
    now.tm_min = time.tm_min;
    return now;
  }

  struct tm parseDate(std::string datetime) {
    struct tm now = getNow();
    struct tm date;
    strptime(datetime.c_str(), "%d/%m/%Y", &date);
    date.tm_hour = now.tm_hour;
    date.tm_min = now.tm_min;
    date.tm_sec = now.tm_sec;
    return date;
  }

  struct tm asDateTime(time_t t) {
    struct tm dateTime;
    return *(localtime (&t));
  }

  time_t asTimestamp(struct tm a) {
    return mktime(&a);
  }

  struct tm addHours(struct tm datetime, int n) {
    time_t t = asTimestamp(datetime);
    t += (n * 60 * 60);
    return asDateTime(t);
  }

  struct tm addDays(struct tm datetime, int n) {
    return addHours(datetime, 24 * n);
  }

  bool hasSameTime(struct tm *a, struct tm *b) {
    return (a->tm_hour == b->tm_hour) && (a->tm_min == b->tm_min);
  }

  bool hasSameDate(struct tm *a, struct tm *b) {
    return (a->tm_year == b->tm_year) && (a->tm_mon == b->tm_mon) && (a->tm_mday == b->tm_mday);
  }

  bool timeIsBeforeEq(struct tm a, struct tm b) {
    if(a.tm_hour > b.tm_hour) {
      return false;
    } else if(a.tm_hour < b.tm_hour) {
      return true;
    } else {
      if(a.tm_min > b.tm_min) {
        return false;
      } else {
        return true;
      }
    }
  }

  bool timeIsEq(struct tm a, struct tm b) {
    return (a.tm_hour == b.tm_hour) && (a.tm_min == b.tm_min);
  }

  bool timeIsBeforeNotEq(struct tm a, struct tm b) {
    return timeIsBeforeEq(a, b) && !timeIsEq(a, b);
  }

  bool dateIsBeforeEq(struct tm a, struct tm b) {
    if(a.tm_year > b.tm_year) {
      return false;
    } else if(a.tm_year < b.tm_year) {
      return true;
    } else {
      if(a.tm_mon > b.tm_mon) {
        return false;
      } else if(a.tm_mon < b.tm_mon) {
        return true;
      } else {
        if(a.tm_mday > b.tm_mday) {
          return false;
        } else {
          return true;
        }
      }
    }
  }

  bool dateIsEq(struct tm a, struct tm b) {
    return (a.tm_year == b.tm_year) && (a.tm_mon == b.tm_mon) && (a.tm_mday == b.tm_mday);
  }

  bool dateIsBeforeNotEq(struct tm a, struct tm b) {
    return dateIsBeforeEq(a, b) && !dateIsEq(a, b);
  }

  bool datetimeIsBeforeEq(struct tm a, struct tm b) {
    if(dateIsBeforeNotEq(a, b)) {
      return true;
    } else if(dateIsBeforeNotEq(b, a)) {
      return false;
    } else {
      return timeIsBeforeEq(a, b);
    }
  }

  Json::Value toJson(std::string value) {
    Json::Value json;
    Json::Reader reader;
    reader.parse(value, json);
    return json;
  }

  std::map<std::string, std::list<CalendarException>> parseCalendarExceptions(Json::Value json) {
    std::map<std::string, std::list<CalendarException>> calendarExceptions;
    for(auto const &serviceId : json.getMemberNames()) {
      std::list<CalendarException> exceptions;
      Json::Value array = json[serviceId];
      for(int index=0; index < array.size(); ++index) {
        CalendarException calendarException;
        Json::Value value = array[index];
        calendarException.serviceId = value["serviceId"].asString();
        calendarException.date = parseDate(value["date"].asString());
        calendarException.exceptionType = value["exceptionType"].asInt();
        exceptions.push_back(calendarException);
      }
      calendarExceptions[serviceId] = exceptions;
    }
    return calendarExceptions;
  }

  StopTime parseStopTime(Json::Value value) {
    struct StopTime stopTime;
    stopTime.tripId = value["tripId"].asString();
    stopTime.arrival = parseTime(value["arrival"].asString());
    stopTime.departure = parseTime(value["departure"].asString());
    stopTime.pos = value["pos"].asInt();
    return stopTime;
  }

  std::list<StopTime> parseStopTimes(Json::Value array) {
    std::list<StopTime> stopTimes;
    long size = array.size();
    for(int index=0; index < size; ++index) {
      StopTime stopTime = parseStopTime(array[index]);
      stopTimes.push_back(stopTime);
    }
    return stopTimes;
  }

  std::list<std::string> parseEdges(Json::Value array) {
    std::list<std::string> stopIds;
    for(int index=0; index < array.size(); index++) {
      stopIds.push_back(array[index].asString());
    }
    return stopIds;
  }

  std::unique_ptr<Calendar> parseCalendar(Json::Value value) {
    std::unique_ptr<Calendar> calendar(new Calendar());
    std::map<std::string, bool> week;
    week["monday"] = value["monday"].asString() == "1";
    week["tuesday"] = value["tuesday"].asString() == "1";
    week["wednesday"] = value["wednesday"].asString() == "1";
    week["thursday"] = value["thursday"].asString() == "1";
    week["friday"] = value["friday"].asString() == "1";
    week["saturday"] = value["saturday"].asString() == "1";
    week["sunday"] = value["sunday"].asString() == "1";

    calendar->serviceId = value["serviceId"].asString();
    calendar->week = week;
    calendar->startDate = parseDate(value["startDate"].asString());
    calendar->endDate = parseDate(value["endDate"].asString());
    return calendar;
  }

  Vertice parseVerticeRow(std::list< std::map<std::string, const void*> >::const_iterator it) {
    std::map<std::string, const void*> row = *it;
    const char*id = (const char*)row["id"];
    const char*name = (const char*)row["name"];
    const char*edges = (const char*)row["edges"];
    const char*stopTimes = (const char*)row["stopTimes"];
    struct Vertice vertice;
    vertice.id = id;
    vertice.name = name;
    vertice.edges = parseEdges(toJson(edges));
    vertice.stopTimes = parseStopTimes(toJson(stopTimes));
    return vertice;
  }

  Trip parseTripRow(std::list< std::map<std::string, const void*> >::const_iterator it) {
    std::map<std::string, const void*> row = *it;
    const char *id = (const char*)row["id"];
    const char *calendar = (const char*)row["service"];
    const char *direction = (const char*)row["direction"];
    struct Trip trip;
    trip.id = id;
    if(std::string(calendar) != "null") {
      trip.calendar = parseCalendar(toJson(calendar));
    }
    trip.direction = direction;
    return trip;
  }

  std::map< std::string, const void*> parseRow(sqlite3_stmt *stmt) {
    int cols = sqlite3_column_count(stmt);
    std::map<std::string, const void*> row;
    for(int col=0 ; col<cols; col++) {
      std::string name(sqlite3_column_name(stmt, col));
      row[name] = strdup((const char *)sqlite3_column_text(stmt, col));
    }
    return row;
  }

  std::list< std::map<std::string, const void*> > executeSQL(sqlite3 *handle, std::string query) {
    std::list< std::map <std::string, const void*> > results;
    sqlite3_stmt *stmt;
    sqlite3_prepare_v2(handle, query.c_str(),-1, &stmt, 0);
    int retval;
    while(1) {
      retval = sqlite3_step(stmt);
      if(retval == SQLITE_ROW) {
        results.push_back(parseRow(stmt));
      } else if(retval == SQLITE_DONE) {
        return results;
      } else {
        throw std::runtime_error("Unexpected error while executing this SQL query: " + query);
      }
    }
  }

  sqlite3* openConnection(std::string path) {
    sqlite3 *handle;
    sqlite3_open_v2(path.c_str(), &handle, SQLITE_OPEN_READONLY, NULL);
    return handle;
  }

  std::map<std::string, Vertice> buildGraph(sqlite3 *handle) {
    std::map<std::string, Vertice> graph;
    std::list< std::map<std::string, const void*> > results = executeSQL(handle, "SELECT * FROM GRAPH;");
    for (std::list< std::map<std::string, const void*> >::const_iterator iterator = results.begin(), end = results.end(); iterator != end; ++iterator) {
      Vertice vertice = parseVerticeRow(iterator);
      graph[vertice.id] = vertice;
    }
    return graph;
  }

  std::string getVersion(sqlite3 *handle) {
    std::string query = "SELECT value FROM CACHE WHERE key = 'version'";
    std::list< std::map<std::string, const void*> > results = executeSQL(handle, query);
    return (char *)results.front()["value"];
  }

  Vertice getVerticeById(sqlite3 *handle, std:: string id) {
    std::string query = "SELECT * FROM GRAPH WHERE id = '" + id + "'";
    std::list< std::map<std::string, const void*> > results = executeSQL(handle, query);
    return parseVerticeRow(results.begin());
  }

  std::map<std::string, std::list<CalendarException>> getCalendarExceptions(sqlite3 *handle) {
    std::string query = "SELECT value FROM CACHE WHERE key = 'exceptions'";
    std::list< std::map<std::string, const void*> > results = executeSQL(handle, query);
    char *exceptions = (char *)results.front()["value"];
    return parseCalendarExceptions(toJson(exceptions));
  }

  std::list<Trip> getTripsByIds(sqlite3 *handle, std::list<std::string> ids) {
    std::list<Trip> trips;
    std::string params = std::accumulate(ids.begin(), ids.end(), (std::string)"", [](std::string acc, std::string id) {
        std::string p = "id = '" + id + "'";
        return (acc == "") ? p : (acc + " OR " + p);
      });
    if(params != "") {
      std::string query = "SELECT * FROM TRIPS WHERE " + params;
      std::list< std::map<std::string, const void*> > results = executeSQL(handle, query);
      for (std::list< std::map<std::string, const void*> >::const_iterator iterator = results.begin(), end = results.end(); iterator != end; ++iterator) {
        trips.push_back(parseTripRow(iterator));
      }
    }
    return trips;
  }

  struct ArrivalTime {
    std::string stopId;
    struct tm arrival;
    struct tm departure;
    std::string tripId;
    Vertice *vertice;
    int pos;
  };

  bool isTerminus(StopTime *a) {
    return hasSameTime(&a->arrival, &a->departure) && a->pos > 0;
  }

  class CompareArrivalTime {
  public:
    bool operator()(const ArrivalTime& gi, const ArrivalTime& gj) {
      return timeIsBeforeEq(gj.departure, gi.departure);
    }
  };

  bool isTripRemovedOn(std::list<Trip>::const_iterator trip, std::map<std::string, std::list<CalendarException>> *calendarExceptions, struct tm when) {
    auto exceptions = calendarExceptions->find(trip->calendar->serviceId);
    if(exceptions != calendarExceptions->end()) {
      auto it = std::find_if(exceptions->second.begin(), exceptions->second.end(), [&](CalendarException exception) {
        return hasSameDate(&exception.date, &when) && (exception.exceptionType == 2);
      });
      return it != exceptions->second.end();
    } else {
      return false;
    }
  }

  bool isTripAddedOn(std::list<Trip>::const_iterator trip, std::map<std::string, std::list<CalendarException>> *calendarExceptions, struct tm when) {
    auto exceptions = calendarExceptions->find(trip->calendar->serviceId);
    if(exceptions != calendarExceptions->end()) {
      auto it = std::find_if(exceptions->second.begin(), exceptions->second.end(), [&](CalendarException exception) {
        return hasSameDate(&exception.date, &when) && (exception.exceptionType == 1);
      });
      return it != exceptions->second.end();
    } else {
      return false;
    }
  }

  bool isTripValidToday(std::list<Trip>::const_iterator trip, struct tm when) {
    std::map<int, std::string> week { {1, "monday"}, {2, "tuesday"}, {3, "wednesday"}, {4, "thursday"}, {5, "friday"}, {6, "saturday"}, {0, "sunday"}};
    return trip->calendar->week[week[when.tm_wday]];
  }

  bool isTripInPeriod(std::list<Trip>::const_iterator trip, struct tm when) {
    struct tm startDate = trip->calendar->startDate;
    struct tm endDate = trip->calendar->endDate;
    bool before = dateIsBeforeEq(startDate, when);
    bool after = dateIsBeforeEq(when, endDate);
    return before && after;
  }

  bool isTripValidOn(std::list<Trip>::const_iterator trip, std::map<std::string, std::list<CalendarException>> *calendarExceptions, struct tm when) {
    if(trip->calendar != NULL) {
      bool removed = isTripRemovedOn(trip, calendarExceptions, when);
      bool added = isTripAddedOn(trip, calendarExceptions, when);
      bool availableToday = isTripValidToday(trip, when);
      bool inPeriod = isTripInPeriod(trip, when);
      return (!removed && inPeriod && availableToday) || added;
    }
    return false;
  }

  std::map<std::string, bool> tripsAvailability(sqlite3 *handle, std::list<std::string> ids, std::map<std::string, std::list<CalendarException>> *calendarExceptions, struct tm when) {
    std::map<std::string, bool> availablities;
    auto trips = getTripsByIds(handle, ids);
    for (std::list<Trip>::const_iterator iterator = trips.begin(), end = trips.end(); iterator != end; ++iterator) {
      availablities[iterator->id] = isTripValidOn(iterator, calendarExceptions, when);
    }
    return availablities;
  }

  std::list<StopTime> sortStopTimesBy(std::list<StopTime> stopTimes, struct tm t) {
    typedef std::tuple<std::list<StopTime>, std::list<StopTime>> Splitted;
    Splitted s = std::tuple<std::list<StopTime>, std::list<StopTime>>();

    Splitted beforeAfter = std::accumulate(stopTimes.begin(), stopTimes.end(), s, [t](Splitted acc, StopTime stopTime) {
        if(timeIsBeforeEq(stopTime.departure, t)) {
          stopTime.departure = addDays(stopTime.departure, 1);
          stopTime.arrival = addDays(stopTime.arrival, 1);
          std::get<0>(acc).push_back(stopTime);
        } else {
          std::get<1>(acc).push_back(stopTime);
        }
        return acc;
    });

    std::list<StopTime> tommorow = std::get<0>(beforeAfter);
    std::list<StopTime> next = std::get<1>(beforeAfter);
    next.insert(next.end(), tommorow.begin(), tommorow.end());
    next.sort([](const StopTime& first, const StopTime& second) {
      return datetimeIsBeforeEq(first.departure, second.departure);
    });

    return next;
  }

  std::list<StopTime> getAvailableDepartures(sqlite3 *handle, std::map<std::string, std::list<CalendarException>> *calendarExceptions, ArrivalTime *vi, struct tm ts) {
    std::list<StopTime> departures(sortStopTimesBy(vi->vertice->stopTimes, ts));

    departures.remove_if([&] (StopTime &stopTime) {
        return !(timeIsBeforeNotEq(vi->arrival, stopTime.departure) && !isTerminus(&stopTime));
    });

    std::list<std::string> tripIds;
    for (std::list<StopTime>::const_iterator iterator = departures.begin(), end = departures.end(); iterator != end; ++iterator) {
      tripIds.push_back(iterator->tripId);
    }

    auto availablities = tripsAvailability(handle, tripIds, calendarExceptions, ts);

    departures.remove_if([&] (const StopTime& stopTime) {
      return !availablities[stopTime.tripId];
    });

    return departures;
  }

  std::map<std::string, ArrivalTime> refineArrivalTimes(sqlite3 *handle, std::map<std::string, Vertice> *graph, std::map<std::string, std::list<CalendarException>> *calendarExceptions, std::string vsId, std::string veId, struct tm ts) {

    std::map<std::string, ArrivalTime> results;
    std::map< std::string, ArrivalTime > pushed;

    // Initialize the queue

    std::priority_queue<ArrivalTime, std::vector<ArrivalTime>, CompareArrivalTime> queue;

    Vertice vs = (*graph)[vsId];

    struct ArrivalTime gs;
    gs.stopId = vsId;
    gs.arrival = ts;
    gs.vertice = &vs;
    queue.push(gs);
    pushed[vsId] = gs;

    // OK, Let's go !

    while(!queue.empty()) {

      ArrivalTime head = pushed[queue.top().stopId];
      queue.pop();

      results[head.stopId] = head;

      if(head.stopId == veId) {
        printf("\nDONE!");
        return results;
      } else {

        Vertice vi = *(head.vertice);
        auto departures = getAvailableDepartures(handle, calendarExceptions, &head, ts);

        if(!departures.empty()) {

          for (std::list<std::string>::const_iterator iterator = vi.edges.begin(), end = vi.edges.end(); iterator != end; ++iterator) {
            std::string vjId = *iterator;
            Vertice *vj = &(*graph)[vjId];
            std::list<StopTime> stopTimes(sortStopTimesBy(vj->stopTimes, head.arrival));

            auto arrivalTimes = std::accumulate(departures.begin(), departures.end(), std::list<StopTime>(), [&stopTimes](std::list<StopTime> acc, StopTime departureTime) {
                auto it = std::find_if(stopTimes.begin(), stopTimes.end(), [&departureTime](StopTime stopTime) {
                    return departureTime.tripId == stopTime.tripId && timeIsBeforeNotEq(departureTime.departure, stopTime.arrival);
                });
                if(it != stopTimes.end()) {
                  acc.push_back(*it);
                }
                return acc;
            });

            if(!arrivalTimes.empty()) {
              StopTime next = arrivalTimes.front();
              struct ArrivalTime arrivalTime;
              arrivalTime.stopId = vjId;
              arrivalTime.arrival = next.arrival;
              arrivalTime.departure = next.departure;
              arrivalTime.tripId = next.tripId;
              arrivalTime.vertice = vj;
              arrivalTime.pos = next.pos;
              if(pushed.find(vjId) == pushed.end()) {
                queue.push(arrivalTime);
              }
              pushed[vjId] = arrivalTime;
            }
          }

        } else {
          printf("\nEMPTY!");
        }
      }
    };
    return results;
  }

  std::list<ArrivalTime> pathSelection(std::map<std::string, Vertice> *graph, std::map<std::string, ArrivalTime> *arrivalTimes, struct tm ts, std::string vsId, std::string veId) {
    Vertice vs = (*graph)[vsId];
    Vertice vj = (*graph)[veId];
    ArrivalTime ge = (*arrivalTimes)[vj.id];
    std::list<ArrivalTime> path;
    while(vj.id != vs.id) {
      ArrivalTime gj = (*arrivalTimes)[vj.id];
      std::list< std::pair<ArrivalTime, Vertice> > matched;
      for (std::list<std::string>::const_iterator iterator = vj.edges.begin(), end = vj.edges.end(); iterator != end; ++iterator) {
        std::string viId = *iterator;
        Vertice vi = (*graph)[viId];
        auto gi = arrivalTimes->find(viId);
        if(gi != arrivalTimes->end()) {
          auto found = std::find_if(vi.stopTimes.begin(), vi.stopTimes.end(), [&](StopTime viStopTime) {
            return viStopTime.tripId == gj.tripId && timeIsBeforeNotEq(viStopTime.departure, gj.arrival);
          });
          if(found != vi.stopTimes.end()) {
            matched.push_back(std::make_pair(gi->second, vi));
          }
        }
      }

      if(!matched.empty()) {
        matched.sort([&](std::pair<ArrivalTime, Vertice> a, std::pair<ArrivalTime, Vertice> b) {
            return a.first.pos >= b.first.pos;
        });
        vj = matched.front().second;
        path.push_front(gj);
      } else {
        printf("\n ERROR");
        //ERROR
        break;
      }
    }

    ArrivalTime last = path.front();
    ArrivalTime gs = (*arrivalTimes)[vsId];
    auto stopTimeGs = *(std::find_if(vs.stopTimes.begin(), vs.stopTimes.end(), [&](StopTime stopTime) {
      return stopTime.tripId == last.tripId;
    }));
    gs.departure = stopTimeGs.departure;
    gs.arrival = stopTimeGs.arrival;

    path.push_front(gs);
    return path;
  }
}
