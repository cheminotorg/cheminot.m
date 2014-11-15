var gulp = require('../../gulpfile.js'),
    Q = require('q'),
    fs = require('fs');

module.exports = function (tarifa) {
    var d = Q.defer();
    var shouldHaveBrowser = tarifa.settings.platforms.reduce(function(acc, platform) {
        return (acc === true) ? acc : platform === 'browser';
    }, false);

    if(shouldHaveBrowser) {
        fs.exists('app/platforms/browser', function(exists) {
            if(!exists) {
                tarifa.settings.platforms = tarifa.settings.platforms.filter(function (p) {
                    return p !== 'browser';
                });
                fs.writeFile('tarifa.json', JSON.stringify(tarifa.settings, null, 2), function() {
                    gulp.doneCallback = function() {
                        d.resolve(tarifa);
                    };
                    gulp.start.apply(gulp, ['setup:browser']);
                });
            }
        });
    }
    return d.promise;
};
