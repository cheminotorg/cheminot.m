/*
 * build.js
 */

var Q = require('q');
var browserify = require('browserify');
var watchify = require('watchify');
var fs = require('fs');
var chokidar = require('chokidar');
var gulp = require('gulp');
var buildFile = require('../gulpfile');
var path = require('path');
var tsify = require('tsify');
var spawn = require('child_process').spawn;
var gzip = require('gulp-gzip');

var w,
    wwwWatcher,
    stylWatcher,
    htmlWatcher,
    srcFolder = path.join(__dirname, '../src'),
    wwwFolder = path.join(__dirname, '../www'),
    dataFolder = path.join(wwwFolder, 'data'),
    bundledJS = path.join(wwwFolder, 'js', 'app.js');

module.exports.build = function build(platform, settings, config) {
  var defer = Q.defer();

  buildContext(settings, platform, config).then(function(context) {

    gulp.add('html', function() {
      return buildFile.buildHtml(srcFolder, wwwFolder, context);
    });

    gulp.add('css', function() {
      return buildFile.buildStyl(srcFolder, wwwFolder);
    });

    gulp.add('scripts', function() {
      return buildFile.buildScripts(srcFolder, wwwFolder);
    });

    if(config === 'demo') {

      gulp.add('compress:js', function() {
        return gulp.src(bundledJS)
          .pipe(gzip())
          .pipe(gulp.dest(path.join(wwwFolder, 'js')));
      });

      gulp.add('compress:data', function() {
        return gulp.src(path.join(dataFolder, '*.json'))
          .pipe(gzip())
          .pipe(gulp.dest(dataFolder));
      });

      gulp.start(['html', 'css', 'scripts'], ['compress:js', 'compress:data'], function(err) {
        if (err) defer.reject(err);
        else defer.resolve();
      });

    } else {

      gulp.start('html', 'css', 'scripts', function(err) {
        if (err) defer.reject(err);
        else defer.resolve();
      });
    }

  });

  return defer.promise;
};

module.exports.watch = function watch(f, settings, platform, config) {

  buildContext(settings, platform, config).then(function(context) {

    launchWatchify(f).then(function(bw) {
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
          console.log('styl file ' + p + ' updated');
          buildFile.buildStyl(srcFolder, wwwFolder);
        });

        htmlWatcher.on('change', function(p) {
          console.log('html file ' + p + ' updated');
          buildFile.buildHtml(srcFolder, wwwFolder, context);
        });
      }, 4000);

    });

  });
};

module.exports.close = function() {
  if (w) w.close();
  if (wwwWatcher) wwwWatcher.close();
  if (stylWatcher) stylWatcher.close();
  if (htmlWatcher) htmlWatcher.close();
};

function gitVersion() {
  var d = Q.defer();
  var child = spawn('git', ['describe', '--long', '--always']);
  child.stdout.on('data', function(chunk) {
    d.resolve(chunk.toString('utf-8').trim());
  });
  return d.promise;
}

function mapSettings(settings, platform, config) {
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

function buildContext(settings, platform, config) {
  return gitVersion().then(function(sha) {
    var context = mapSettings(settings, platform, config);
    context.gitVersion = sha;
    context.platform = platform;
    context.mocked = config === 'default';
    context.demo = config === 'demo';
    return context;
  });
}

function bundle() {
  var defer = Q.defer();
  var opts = {
    debug: true,
    cache: {},
    packageCache: {},
    fullPaths: true
  };

  var b = browserify(path.join(srcFolder, 'ts', 'main.ts'), opts).plugin(tsify, {
    module: 'commonjs',
    noImplicitAny: true,
    safe: true,
    target: 'ES5'
  });

  if (fs.existsSync(bundledJS)) fs.unlinkSync(bundledJS);

  var ws = fs.createWriteStream(bundledJS);

  b.bundle(rejectOnError(defer)).pipe(ws);

  ws.on('finish', function() {
    ws.end();
    defer.resolve(b);
  });

  return defer.promise;
}

function launchWatchify(f) {
  return bundle().then(function(b) {
    var w = watchify(b);

    b.bundle(function() {
      w.on('log', log);
    });

    w.on('update', function() {
      var ws = fs.createWriteStream(bundledJS);

      w.bundle(log).pipe(ws);

      ws.on('finish', function() {
        ws.end();
        f(bundledJS);
      });
    });
    return w;
  });
}

function rejectOnError(d) {
  return function(err) {
    log(err);
    if (err) d.reject(err);
  };
}

function log(o) {
  if (o) console.log('- browserify - ' + o);
}
