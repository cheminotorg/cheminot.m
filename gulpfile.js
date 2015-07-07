var gulp = require('gulp'),
    ts = require('gulp-tsc'),
    stylus = require('gulp-stylus'),
    gutil = require('gulp-util'),
    del = require('del'),
    exec = require('gulp-exec'),
    watch = require('gulp-watch'),
    rename = require('gulp-rename'),
    browserify = require('gulp-browserify'),
    streamify = require('gulp-streamify'),
    autoprefixer = require('gulp-autoprefixer'),
    runSequence = require('run-sequence'),
    minifyCss = require('gulp-minify-css'),
    gzip = require('gulp-gzip'),
    minimist = require('minimist'),
    fs = require('fs');

var minimistOptions = {
  string: ['env', 'mode']
};

var options = minimist(process.argv.slice(2), minimistOptions);

var Assets = {
  ts: {
    src: {
      files: ['project/src/ts/**/*.ts'],
      main: ['project/src/ts/main.ts'],
      dir: 'project/src/ts/'
    },
    dest: {
      files : ['project/www/js/**/*.js', '!project/www/js/vendors/**/*.js', '!project/www/js/settings.js', 'project/www/js/**/*.gz', 'project/www/data/**/*.gz'],
      dir: 'project/www/js/'
    }
  },
  styl: {
    src: {
      files: ['project/src/styl/**/*.styl'],
      dir: 'project/src/styl/',
      main: ['project/src/styl/main.styl']
    },
    dest: {
      files: ['project/www/css/**/*.css'],
      dir: 'project/www/css/'
    }
  },
  vendors: {
    src: {
      requirejs: 'project/node_modules/requirejs/require.js',
      q: 'project/node_modules/q/q.js',
      mithril: 'project/node_modules/mithril/mithril.js',
      Zanimo: 'project/node_modules/zanimo/src/Zanimo.js',
      IScroll: 'project/node_modules/iscroll/build/iscroll-probe.js',
      moment: 'project/node_modules/moment/moment.js',
      lodash: 'project/node_modules/lodash/lodash.js',
      qstart: 'project/node_modules/qstart/qstart.js',
      qajax: 'project/node_modules/qajax/src/browser.js'
    },
    dest: 'project/www/js/vendors/'
  }
};

gulp.task('clean:vendors', function(cb) {
  del([Assets.vendors.dest], cb);
});

gulp.task('vendors', ['clean:vendors'], function() {
  function browserifyVendor(path, name) {
    return gulp.src(path)
      .pipe(browserify({ "standalone": name }))
      .pipe(rename(function(path) {
        if(path.basename == 'browser') {
          path.basename = 'qajax';
        }
        return path;
      }))
      .pipe(gulp.dest(Assets.vendors.dest));
  }

  gulp.src(Assets.vendors.src.requirejs).pipe(gulp.dest(Assets.vendors.dest));

  Object.keys(Assets.vendors.src).forEach(function(vendor) {
    if(vendor != 'requirejs') {
      browserifyVendor(Assets.vendors.src[vendor], vendor);
    }
  });
});

gulp.task('clean:js', function(cb) {
  del(Assets.ts.dest.files, cb);
});

gulp.task('ts', ['clean:js'], function() {
  return gulp.src(Assets.ts.src.main)
    .pipe(ts({
      module: 'amd',
      noImplicitAny: true,
      safe: true,
      target: 'ES5'
    }))
    .on('error', function (err) {
      console.log(err);
    })
    .pipe(gulp.dest(Assets.ts.dest.dir));
});

gulp.task('clean:css', function(cb) {
  del([Assets.styl.dest.dir], cb);
});

gulp.task('styl', ['clean:css'], function() {
  return gulp.src(Assets.styl.src.main)
    .pipe(stylus())
    .pipe(streamify(autoprefixer()))
    .pipe(minifyCss())
    .pipe(gulp.dest(Assets.styl.dest.dir));
});

gulp.task('requirejs', ['ts'], function() {

  function flatten(obj, prefix) {
    return Object.keys(obj).reduce(function(acc, key) {
      var param = (prefix ? prefix + '.' : '') + key + '="' + obj[key] + '"';
      return acc + ' ' + param;
    }, '');
  };

  var main = {
    baseUrl: Assets.ts.dest.dir,
    out: Assets.ts.dest.dir + "main.js",
    name: 'main'
  };

  var paths = {
    'mithril': 'vendors/mithril',
    'q': 'vendors/q',
    'Zanimo': 'vendors/Zanimo',
    'IScroll': 'vendors/iscroll-probe',
    'moment': 'vendors/moment',
    'lodash': 'vendors/lodash',
    'qajax': 'vendors/qajax',
    'qstart': 'vendors/qstart'
  };

  var params = '-o' + flatten(main) + ' ' + flatten(paths, 'paths');

  return gulp.src('.')
    .pipe(exec('node_modules/requirejs/bin/r.js ' + params))
    .pipe(exec.reporter());
});

gulp.task('watch', ['compile'], function() {
  var assets = Assets.ts.src.files.concat(Assets.styl.src.files);
  gulp.watch(assets, ['compile']);
});

gulp.task('default', ['watch']);

gulp.task('compile', ['ts', 'styl']);

gulp.task('compress:demo:js', function() {
  gulp.src(['project/www/js/main.js'])
    .pipe(gzip())
    .pipe(gulp.dest('project/www/js/'));
});

gulp.task('compress:demo:data', function() {
  gulp.src(['project/www/data/*.json'])
    .pipe(gzip())
    .pipe(gulp.dest('project/www/data/'));
});

gulp.task('clean:demo', function(cb) {
  del(Assets.ts.dest.files.concat(['!project/www/js/main.js']), cb);
});

gulp.task('compile:demo', function(cb) {
  if(options.mode == 'prod') {
    runSequence(['requirejs', 'styl'], ['compress:demo:data', 'compress:demo:js'], 'clean:demo', cb);
  } else {
    runSequence('compile', cb);
  }
});

gulp.task('build', function() {
  return gulp.src('.')
    .pipe(exec('tarifa build web'))
    .pipe(exec.reporter());
});

gulp.task('setup:android', function() {
  return gulp.src('.')
    .pipe(exec('tarifa platform add android'))
    .pipe(exec.reporter());
});

gulp.task('setup:browser', function() {
  return gulp.src('.')
    .pipe(exec('tarifa platform add browser'))
    .pipe(exec.reporter());
});

module.exports = gulp;
