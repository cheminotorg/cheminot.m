#include <sqlite3.h>
#include <map>
#include <list>

namespace cheminotc {

  /* struct Vertice { */
  /*   std::string id; */
  /*   std::string name; */
  /*   std::list<std::string> edges; */
  /*   std::list<StopTime> stopTimes; */
  /* }; */

  /* struct StopTime { */
  /*   std::string tripId; */
  /*   struct tm arrival; */
  /*   struct tm departure; */
  /*   int pos; */
  /* }; */

  sqlite3* openConnection(std::string path);
  std::string getVersion(sqlite3 *handle);
  //std::map<std::string, Vertice> buildGraph(sqlite3 *handle);
}
