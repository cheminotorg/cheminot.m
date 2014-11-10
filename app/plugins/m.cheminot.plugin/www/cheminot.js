var exec = require('cordova/exec');

var Cheminot = function() {
};

Cheminot.init = function() {
    exec(null, null, "Cheminot", "init", []);
};

module.exports = Cheminot;
