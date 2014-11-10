var gulp = require('gulp'),
    ts = require('gulp-tsc'),
    stylus = require('gulp-stylus'),
    gutil = require('gulp-util'),
    nib = require('nib'),
    sourcemaps = require('gulp-sourcemaps'),
    clean = require('gulp-rimraf'),
    exec = require('gulp-exec'),
    rjs = require('sre-gulp-rjs'),
    watch = require('gulp-watch'),
    browserify = require('gulp-browserify'),
    fs = require('fs');

var Assets = {
    ts: {
        src: {
            files: ['project/src/ts/**/*.ts'],
            main: ['project/src/ts/main.ts'],
            dir: 'project/src/ts/'
        },
        dest: {
            files : ['project/www/js/**/*.js', '!project/www/js/vendors/**/*.js', '!project/www/js/settings.js'],
            dir: 'project/www/js/'
        }
    },
    styl: {
        src: {
            files: ['project/src/styl/**/*.styl'],
            dir: 'project/src/styl/'
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
            lodash: 'project/node_modules/lodash/lodash.js'
        },
        dest: 'project/www/js/vendors/'
    }
};

gulp.task('clean-vendors', function() {
    return gulp.src(Assets.vendors.dest)
        .pipe(clean());
});

gulp.task('vendors', ['clean-vendors'], function() {
    function browserifyVendor(path, name) {
        return gulp.src(path)
            .pipe(browserify({ "standalone": name }))
            .pipe(gulp.dest(Assets.vendors.dest));
    }

    gulp.src(Assets.vendors.src.requirejs).pipe(gulp.dest(Assets.vendors.dest));

    Object.keys(Assets.vendors.src).forEach(function(vendor) {
        if(!['requirejs'].some(function(v) { return v == vendor;})) {
            browserifyVendor(Assets.vendors.src[vendor], vendor);
        }
    });
});

gulp.task('clean-js', function() {
    return gulp.src(Assets.ts.dest.files)
        .pipe(clean());
});

gulp.task('ts', ['clean-js'], function() {
    return gulp.src(Assets.ts.src.main)
        .pipe(ts({
            module: 'amd',
            noImplicitAny: true,
            safe: true,
            noLib: true
        }))
        .pipe(gulp.dest(Assets.ts.dest.dir));
});

gulp.task('clean-css', function() {
    return gulp.src(Assets.styl.dest.dir)
        .pipe(clean());
});

gulp.task('styl', ['clean-css'], function() {
    return gulp.src(Assets.styl.src.files)
        .pipe(stylus({
            use: nib(),
            compress: true
        }))
        .pipe(gulp.dest(Assets.styl.dest.dir));
});

gulp.task('requirejs', ['ts'], function() {
    return gulp.src(Assets.ts.dest.files)
        .pipe(gulp.dest(Assets.ts.dest.dir))
        .pipe(rjs({
            baseUrl: Assets.ts.dest.dir,
            out: Assets.ts.dest.dir + 'main.js',
            name: 'main',
            paths: {
                'mithril': 'vendors/mithril',
                'q': 'vendors/q',
                'Zanimo': 'vendors/Zanimo',
                'IScroll': 'vendors/iscroll-probe',
                'moment': 'vendors/moment',
                'lodash': 'vendors/lodash'
            },
            optimize: 'none'
        }));
});

gulp.task('watch', ['compile'], function() {
    var assets = Assets.ts.src.files.concat(Assets.styl.src.files);
    gulp.watch(assets, ['compile']);
});

gulp.task('default', ['watch']);

gulp.task('compile', ['ts', 'styl']);

gulp.task('compile-prod', ['requirejs', 'styl']);

gulp.task('build', function() {
    return gulp.src('.')
        .pipe(exec('tarifa build web', {
            pipeStdout: true
        }));
});

gulp.task('cheminotc-copy-lib', function() {
  return gulp.src('../cheminot.c/lib/jsoncpp/jsoncpp.cpp')
    .pipe(gulp.dest('app/plugins/m.cheminot.plugin/src/android/jni/jsoncpp/'));
});

gulp.task('cheminotc-copy', ['cheminotc-copy-lib'], function() {
  gulp.src('../cheminot.c/cheminotc.cpp')
    .pipe(gulp.dest('app/plugins/m.cheminot.plugin/src/android/jni/cheminotc/'));
});

gulp.task('cheminotc', ['cheminotc-copy'], function() {
  return gulp.src('.')
    .pipe(exec('tarifa plugin remove m.cheminot.plugin', {
      pipeStdout: true
    }))
    .pipe(exec('tarifa plugin add m.cheminot.plugin', {
      pipeStdout: true
    }));
});

module.exports = gulp;
