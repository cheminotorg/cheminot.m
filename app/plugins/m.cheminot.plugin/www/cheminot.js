var exec = require('cordova/exec');

var Cheminot = function() {
};

Cheminot.init = function(success, fail) {
  exec(success, fail, "Cheminot", "init", []);
};

Cheminot.lookForBestTrip = function(vsId, veId, at, te, max, success, fail) {
  exec(function (result) {
    try {
      var trip = JSON.parse(result);
      success && success(trip);
    } catch(e) {
      fail && fail(e);
    }
  }, fail, "Cheminot", "lookForBestTrip", [vsId, veId, at, te, max]);
};

module.exports = Cheminot;
