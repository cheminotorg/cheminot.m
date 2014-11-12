var exec = require('cordova/exec');

var Cheminot = function() {
};

Cheminot.init = function() {
    exec(null, null, "Cheminot", "init", []);
};

Cheminot.lookForBestTrip = function(vsId, veId, at, success, fail) {
    exec(function success(result) {
        var trip = JSON.parse(result);
        success && success(trip);
    }, fail, "Cheminot", "lookForBestTrip", [vsId, veId, at.getTime()]);
};

module.exports = Cheminot;
