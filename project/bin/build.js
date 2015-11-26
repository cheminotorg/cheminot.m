/*
 * build.js
 */

var Q = require('q');
var fs = require('fs');
var chokidar = require('chokidar');
var gulp = require('gulp');
var Watchify = require('./watchify');
var buildFile = require('../gulpfile');
var path = require('path');

var srcFolder = path.join(__dirname, '../src'),
    wwwFolder = path.join(__dirname, '../www'),
    dataFolder = path.join(wwwFolder, 'data');

module.exports.build = function build(platform, settings, config) {
  var defer = Q.defer();

  buildFile.Log.success("Building...");

  buildFile.buildContext(settings, platform, config, function(context) {

    gulp.add('html', function() {
      buildFile.Log.starting('html');
      return buildFile.buildHtml(srcFolder, wwwFolder, context).on('finish', function() {
        buildFile.Log.finished('html');
      });
    });

    gulp.add('styl', function() {
      buildFile.Log.starting('styl');
      return buildFile.buildStyl(srcFolder, wwwFolder).on('finish', function() {
        buildFile.Log.finished('styl');
      });
    });

    gulp.add('scripts', function() {
      buildFile.Log.starting('ts');
      return buildFile.buildScripts(srcFolder, wwwFolder).on('finish', function() {
        buildFile.Log.finished('ts');
      });
    });

    if(config === 'demo') {

      gulp.add('compress:js', function() {
        buildFile.Log.starting('compress:js');
        return buildFile.gzipBundledJS(wwwFolder).on('finish', function() {
          buildFile.Log.finished('compress::js');
        });
      });

      gulp.add('compress:data', function() {
        buildFile.Log.starting('compress:data');
        return buildFile.gzipData(wwwFolder).on('finish', function() {
          buildFile.Log.finished('compress::data');
        });
      });

      gulp.start(['html', 'styl', 'scripts'], ['compress:js', 'compress:data'], function(err) {
        if (err) defer.reject(err);
        else defer.resolve();
      });

    } else {

      gulp.start('html', 'styl', 'scripts', function(err) {
        if (err) defer.reject(err);
        else defer.resolve();
      });
    }

  });

  return defer.promise;
};

var w,
    wwwWatcher,
    stylWatcher,
    htmlWatcher;

module.exports.watch = function watch(f, settings, platform, config) {

  module.exports.build(platform, settings, config).then(function() {

    buildFile.Log.success("Watchifying...");

    buildFile.buildContext(settings, platform, config, function(context) {

      Watchify.launch(srcFolder, wwwFolder, f).then(function(bw) {
        w = bw;

        wwwWatcher = chokidar.watch(wwwFolder, {
          ignored: /app\.js/,
          persistent: true
        });

        stylWatcher = chokidar.watch(path.join(srcFolder, 'styl'), {
          persistent: true
        });

        htmlWatcher = chokidar.watch(path.join(srcFolder, '*.html'), {
          persistent: true
        });

        setTimeout(function() {
          wwwWatcher.on('all', function(evt, p) {
            f(p);
          });

          stylWatcher.on('change', function(p) {
            buildFile.Log.starting('styl');
            buildFile.buildStyl(srcFolder, wwwFolder).on('finish', function() {
              buildFile.Log.finished('styl');
            });
          });

          htmlWatcher.on('change', function(p) {
            buildFile.Log.starting('html');
            buildFile.buildHtml(srcFolder, wwwFolder, context).on('finish', function() {
              buildFile.Log.finished('html');
            });
          });

          buildFile.Log.success("Ready!");

        }, 4000);

      });

    });

  });
};

module.exports.close = function() {
  if (w) w.close();
  if (wwwWatcher) wwwWatcher.close();
  if (stylWatcher) stylWatcher.close();
  if (htmlWatcher) htmlWatcher.close();
};
