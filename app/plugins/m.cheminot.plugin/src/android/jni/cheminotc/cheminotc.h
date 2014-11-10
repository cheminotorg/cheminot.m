#include <sqlite3.h>

namespace cheminotc {
  sqlite3* openConnection(std::string path);
  std::string getVersion(sqlite3 *handle);
}
