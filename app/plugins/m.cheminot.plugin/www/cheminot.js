var exec = require('cordova/exec');

var Cheminot = function() {
};

Cheminot.init = function(success, fail) {
  exec(success, fail, "Cheminot", "init", []);
};

Cheminot.lookForBestTrip = function(vsId, veId, at, te, max, success, fail) {
  var atTimestamp = at.getTime() / 1000;
  var teTimestamp = te.getTime() / 1000;
  exec(function (result) {
    try {
      var trip = JSON.parse(result);
      success && success(trip.map(function(arrivalTime) {
        arrivalTime.arrival = new Date(arrivalTime.arrival * 1000);
        arrivalTime.departure = new Date(arrivalTime.departure * 1000);
        return arrivalTime;
      }));
    } catch(e) {
      fail && fail(e);
    }
  }, fail, "Cheminot", "lookForBestTrip", [vsId, veId, atTimestamp, teTimestamp, max]);
};

module.exports = Cheminot;
