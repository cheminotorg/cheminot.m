var gulp = require('gulp'),
    chalk = require('chalk'),
    ts = require('gulp-tsc'),
    stylus = require('gulp-stylus'),
    gutil = require('gulp-util'),
    del = require('del'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    tsify = require('tsify'),
    streamify = require('gulp-streamify'),
    autoprefixer = require('gulp-autoprefixer'),
    runSequence = require('run-sequence'),
    gzip = require('gulp-gzip'),
    minimist = require('minimist'),
    buffer = require('vinyl-buffer'),
    source = require('vinyl-source-stream'),
    preprocess = require('gulp-preprocess'),
    path = require('path');

var minimistOptions = {
  string: ['env', 'mode']
};

var options = minimist(process.argv.slice(2), minimistOptions);

function isProd() {
  return options.mode === 'prod';
}

function Log() {}

Log.starting = function(task) {
  gutil.log('Starting', '\'' + chalk.cyan(task) + '\...');
};

Log.finished = function(task) {
  gutil.log('Finished', '\'' + chalk.cyan(task));
};

//// HTML

function buildHtml(src, dest, context) {
  return gulp.src(path.join(src, 'index.html'))
    .pipe(preprocess({context: context}))
    .pipe(gulp.dest(dest));
}

gulp.task('html', function() {
  return buildHtml('src', 'www', {
    bundleId: 'xxxx',
    version: 'xxxx',
    appName: 'Cheminot',
    ga_id: 'xxxx',
    gitVersion: 'xxxx',
    platform: 'default',
    mocked: true,
    demo: false
  });
});

//// CSS

function buildStyl(src, dest) {
  gulp.src(path.join(src, 'styl', 'main.styl'))
    .pipe(stylus({ compress: isProd() }))
    .pipe(streamify(autoprefixer()))
    .pipe(gulp.dest(path.join(dest, 'css')));
}

gulp.task('clean:css', function(cb) {
  return del(['www/css/**/*.css'], cb);
});

gulp.task('styl', ['clean:css'], function() {
  return buildStyl('src', 'www');
});

//// Scripts

function buildScripts(src, dest, watch) {
  var opts = { debug: !isProd() };
  var bro = browserify(path.join(src, 'ts', 'main.ts'), opts).plugin(tsify, {
    module: 'commonjs',
    noImplicitAny: true,
    safe: true,
    target: 'ES5'
  });

  var bundler = watch ? watchify(bro) : bro;

  function rebundle() {
    return bundler.bundle()
      .on('error', function (error) { console.error(error.toString()); })
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(gulp.dest(path.join(dest, 'js')));
  }

  if (watch) {
    bundler.on('update', function(p) {
      Log.starting('ts');
      rebundle().on('finish', function() {
        Log.finished('ts');
      });
    });
  }

  return rebundle();
}

gulp.task('clean:js', function(cb) {
  return del(['www/js/**/*.js'], cb);
});

gulp.task('scripts', ['clean:js'], function() {
  return buildScripts('src', 'www');
});

// Watch

gulp.task('watch-styl', ['styl'], function() {
  gulp.watch('src/styl/**/*.styl', ['styl']);
});

gulp.task('watch-html', ['html'], function() {
  gulp.watch(['src/**/*.html'], ['html']);
});

gulp.task('watch-scripts', ['scripts'], function() {
  return buildScripts('src', 'www', true);
});

gulp.task('watch', ['watch-scripts', 'watch-html', 'watch-styl']);

// Default

gulp.task('build', ['scripts', 'css', 'html']);

gulp.task('default', ['watch']);

module.exports = {
  buildHtml: buildHtml,
  buildStyl: buildStyl,
  buildScripts: buildScripts
};
