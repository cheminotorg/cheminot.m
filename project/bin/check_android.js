var gulp = require('../../gulpfile.js'),
    Q = require('q'),
    fs = require('fs');

module.exports = function (tarifa) {
    var d = Q.defer();
    var shouldHaveAndroid = tarifa.settings.platforms.reduce(function(acc, platform) {
        return (acc === true) ? acc : platform === 'android';
    }, false);

    if(shouldHaveAndroid) {
        fs.exists('app/platforms/android', function(exists) {
            if(!exists) {
                tarifa.settings.platforms = tarifa.settings.platforms.filter(function (p) {
                    return p !== 'android';
                });
                fs.writeFile('tarifa.json', JSON.stringify(tarifa.settings, null, 2), function() {
                    gulp.doneCallback = function() {
                        d.resolve(tarifa);
                    };
                    gulp.start.apply(gulp, ['setup:android']);
                });
            }
        });
    }
    return d.promise;
};