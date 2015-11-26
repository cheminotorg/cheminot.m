function map(settings, platform, config) {
  var mapping = require('./mapping');
  var result = {};
  var flatSettings = {};

  for (var k in settings) {
    if (k == 'cordova' && platform == 'browser') {
      flatSettings[k] = settings[k];
      flatSettings[k]['preferences']['SplashScreen'] = 'images/splashscreen.svg';
    } else if (k !== "configurations") {
      flatSettings[k] = settings[k];
    } else {
      for (var l in settings[k][platform][config]) {
        flatSettings[l] = settings[k][platform][config][l];
      }
    }
  }

  for (var j in flatSettings) {
    if (mapping[j] !== undefined) {
      result[mapping[j]] = flatSettings[j];
    }
  }
  return result;
}

module.exports = {
  map: map
};
