/*
 * build.js
 */

var Q = require('q'),
    preprocess = require('preprocess'),
    path = require('path'),
    fs = require('fs'),
    chokidar = require('chokidar'),
    gulp = require('../../gulpfile.js');

function mapSettings(settings, platform, configurationName) {
  var mapping = require('./mapping');
  var result = {};
  var flatSettings = {};

  for (var k in settings) {
    if (k !== "configurations") {
      flatSettings[k] = settings[k];
    } else {
      for (var l in settings[k][platform][configurationName]) {
        flatSettings[l] = settings[k][platform][configurationName][l];
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

module.exports.build = function (platform, settings, configurationName) {
  var d = Q.defer(),
      settingsPath = path.join(__dirname, '../www/js/settings.js'),
      htmlPath = {
        src: path.join(__dirname, '../html/index.html'),
        dest: path.join(__dirname, '../www/index.html')
      };

  gulp.doneCallback = function() {
    var settingsContent = "Settings = " + JSON.stringify(mapSettings(settings, platform, configurationName)) + ';';
    fs.writeFileSync(settingsPath, settingsContent, {"encoding": "utf8"});
    preprocess.preprocessFileSync(htmlPath.src, htmlPath.dest, {
      PLATFORM : platform,
      MOCKED: configurationName == 'default'
    });
    d.resolve();
  };

  switch(configurationName) {
  default: gulp.start.apply(gulp, ['compile']);
  }

  return d.promise;
};

// WATCH
var watcher;
var www = path.join(__dirname, '../www');

module.exports.watch = function watch(f, settings, platform, config) {
  watcher = chokidar.watch(www, { persistent: true });
  setTimeout(function() {
    watcher.on('all', function (evt, p) {
      f(p);
    });
  }, 3000);
};

module.exports.close = function () {
  if(watcher) watcher.close();
};
