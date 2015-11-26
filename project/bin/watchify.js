var browserify = require('browserify');
var Q = require('q');
var path = require('path');
var fs = require('fs');
var watchify = require('watchify');
var tsify = require('tsify');
var buildFile = require('../gulpfile');

function bundledJS(wwwFolder) {
  return path.join(wwwFolder, 'js', 'app.js');
}

function bundle(srcFolder, wwwFolder) {
  var defer = Q.defer();
  var opts = {
    debug: false,
    cache: {},
    packageCache: {},
    fullPaths: true
  };

  var bro = browserify(path.join(srcFolder, 'ts', 'main.ts'), opts).plugin(tsify, {
    module: 'commonjs',
    noImplicitAny: true,
    safe: true,
    target: 'ES5'
  });

  if (fs.existsSync(bundledJS(wwwFolder))) fs.unlinkSync(bundledJS(wwwFolder));

  var ws = fs.createWriteStream(bundledJS(wwwFolder));

  bro.bundle(rejectOnError(defer)).pipe(ws);

  ws.on('finish', function() {
    ws.end();
    defer.resolve(bro);
  });

  return defer.promise;
}

function launch(srcFolder, wwwFolder, f) {
  return bundle(srcFolder, wwwFolder).then(function(bro) {
    var wat = watchify(bro);

    bro.bundle(function() {
      wat.on('log', log);
    });

    wat.on('update', function() {
      var ws = fs.createWriteStream(bundledJS(wwwFolder));

      wat.bundle(log).pipe(ws);

      ws.on('finish', function() {
        ws.end();
        f(bundledJS(wwwFolder));
      });
    });
    return wat;
  });
}

function rejectOnError(d) {
  return function(err) {
    if(err) {
      buildFile.Log.error(err);
      d.reject(err);
    }
  };
}

function log(o) {
  if (o && o.message) {
    buildFile.Log.error(o);
  } else if(o) {
    buildFile.Log.info(o);
  }
}

module.exports = {
  launch: launch
};
