var gulp = require('gulp'),
    ts = require('gulp-tsc'),
    stylus = require('gulp-stylus'),
    gutil = require('gulp-util'),
    del = require('del'),
    watch = require('gulp-watch'),
    rename = require('gulp-rename'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    tsify = require('tsify'),
    streamify = require('gulp-streamify'),
    autoprefixer = require('gulp-autoprefixer'),
    runSequence = require('run-sequence'),
    minifyCss = require('gulp-minify-css'),
    gzip = require('gulp-gzip'),
    minimist = require('minimist'),
    buffer = require('vinyl-buffer'),
    source = require('vinyl-source-stream'),
    fs = require('fs'),
    preprocess = require('gulp-preprocess'),
    path = require('path');

var minimistOptions = {
  string: ['env', 'mode']
};

var options = minimist(process.argv.slice(2), minimistOptions);

function isProd() {
  return options.mode === 'prod';
}

var Assets = {
  ts: {
    src: {
      files: ['src/ts/**/*.ts'],
      main: ['src/ts/main.ts'],
      dir: 'src/ts/'
    },
    dest: {
      files : ['www/js/**/*.js', '!www/js/settings.js', 'www/js/**/*.gz', 'www/data/**/*.gz'],
      dir: 'www/js/'
    }
  },
  styl: {
    src: {
      files: ['src/styl/**/*.styl'],
      dir: 'src/styl/',
      main: ['src/styl/main.styl']
    },
    dest: {
      files: ['www/css/**/*.css'],
      dir: 'www/css/'
    }
  }
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
    appName: 'xxxx',
    ga_id: 'xxxx',
    gitVersion: 'xxxx',
    platform: 'default',
    mocked: false,
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
  return del([Assets.styl.dest.dir], cb);
});

gulp.task('css', ['clean:css'], function() {
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
    bundler.on('update', function() {
      console.log('-> bundling...');
      rebundle();
    });
  }

  return rebundle();
}

gulp.task('clean:js', function(cb) {
  return del(Assets.ts.dest.files, cb);
});

gulp.task('scripts', ['clean:js'], function() {
  return buildScripts('src', 'www');
});

// DEMO

gulp.task('compress:demo:js', function() {
  return gulp.src(['www/js/main.js'])
    .pipe(gzip())
    .pipe(gulp.dest('www/js/'));
});

gulp.task('compress:demo:data', function() {
  return gulp.src(['www/data/*.json'])
    .pipe(gzip())
    .pipe(gulp.dest('www/data/'));
});

gulp.task('build:demo', function(cb) {
  if(isProd()) {
    return runSequence(['scripts', 'css'], ['compress:demo:data', 'compress:demo:js'], cb);
  } else {
    return runSequence('build', cb);
  }
});

// Watch

gulp.task('watch-html-styl', function() {
  gulp.watch(Assets.styl.files, ['css']);
  gulp.watch(['src/index.html'], ['html']);
});


gulp.task('watch-scripts', function() {
  return buildScripts('src', 'www', true);
});

gulp.task('watch', ['html', 'css', 'watch-scripts', 'watch-html-styl']);


// Default

gulp.task('build', ['scripts', 'css']);

gulp.task('default', ['watch']);


module.exports = {
  buildHtml: buildHtml,
  buildStyl: buildStyl,
  buildScripts: buildScripts
};
