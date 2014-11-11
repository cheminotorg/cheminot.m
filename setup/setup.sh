#!/bin/bash

ROOT=$(pwd)
TYPESCRIPT=$1

if [ -z "$TYPESCRIPT" ]
then
    echo "Please provide typescript directory path."
else
    echo "---------------------"
    echo "Installing build tool"
    echo "---------------------"
    npm install

    echo "\n-----------------------"
    echo "Installing dependencies"
    echo "-----------------------"
    cd project
    npm install

    echo "\n------------------------------"
    echo "Linking $TYPESCRIPT to gulp-tsc"
    echo "------------------------------"
    cd "${ROOT}/node_modules/gulp-tsc/node_modules"
    rm -rf typescript
    ln -s $TYPESCRIPT typescript

    echo "\n------------------------------"
    echo "Patching gulp-tsc file"
    echo "------------------------------"
    patch "${ROOT}/node_modules/gulp-tsc/lib/tsc.js" < "${ROOT}/setup/tsc.patch"

    echo "\n------------------------------"
    echo "Add and build platforms"
    echo "------------------------------"
    mkdir "${ROOT}/app/platforms"
    ln -s "${ROOT}/project/www" "${ROOT}/app/www"
    tarifa platform add browser
    tarifa platform add android
    tarifa build android
    tarifa platform add ios
    tarifa build ios

    echo "\n------------------------------"
    echo "Building vendors"
    echo "------------------------------"
    "${ROOT}/node_modules/gulp/bin/gulp.js" vendors

    echo "\n------------------------------"
    echo "Running app in the browser"
    echo "------------------------------"
    tarifa run browser
fi
