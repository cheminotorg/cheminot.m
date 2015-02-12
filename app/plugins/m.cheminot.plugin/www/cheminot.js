var exec = require('cordova/exec');

var Cheminot = function() {
};

Cheminot.init = function(success, fail) {
  exec(function(result) {
    try {
      var meta = JSON.parse(result);
      success && success(meta);
    } catch(e) {
      fail && fail(e);
    }
  }, fail, "Cheminot", "init", []);
};

Cheminot.lookForBestTrip = function(vsId, veId, at, te, max, success, fail) {
  var atTimestamp = at.getTime() / 1000;
  var teTimestamp = te.getTime() / 1000;
  exec(function (result) {
    try {
      var trip = JSON.parse(result);
      if(trip) {
        success && success(trip.map(function(arrivalTime) {
          arrivalTime.arrival = new Date(arrivalTime.arrival * 1000);
          arrivalTime.departure = new Date(arrivalTime.departure * 1000);
          return arrivalTime;
        }));
      } else {
        fail && fail('Computation was probably aborted');
      }
    } catch(e) {
      fail && fail(e);
    }
  }, fail, "Cheminot", "lookForBestTrip", [vsId, veId, atTimestamp, teTimestamp, max]);
};

Cheminot.lookForBestDirectTrip = function(vsId, veId, at, te, success, fail) {
  var atTimestamp = at.getTime() / 1000;
  var teTimestamp = te.getTime() / 1000;
  exec(function (result) {
    try {
      result = JSON.parse(result);
      if(result) {
        success && success([result.hasDirect, result.arrivalTimes.map(function(arrivalTime) {
          arrivalTime.arrival = new Date(arrivalTime.arrival * 1000);
          arrivalTime.departure = new Date(arrivalTime.departure * 1000);
          return arrivalTime;
        })]);
      } else {
        fail && fail('oops');
      }
    } catch(e) {
      fail && fail(e);
    }
  }, fail, "Cheminot", "lookForBestDirectTrip", [vsId, veId, atTimestamp, teTimestamp]);
};

Cheminot.abort = function(success, fail) {
  exec(success, fail, "Cheminot", "abort", []);
};

module.exports = Cheminot;
