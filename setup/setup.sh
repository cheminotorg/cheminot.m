#!/bin/bash

ROOT=$(pwd)
TYPESCRIPT=$1

if [ -z "$TYPESCRIPT" ]
then
    echo "Please provide typescript directory path."
else
    echo "\n---------------------"
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
    echo "Building vendors"
    echo "------------------------------"
    "${ROOT}/node_modules/gulp/bin/gulp.js" vendors

    echo "\n------------------------------"
    echo "Setup platforms"
    echo "------------------------------"
    mkdir "${ROOT}/app/platforms"
    ln -s "${ROOT}/project/www" "${ROOT}/app/www"
    tarifa check
    patch "${ROOT}/app/platforms/android/build.gradle" < "${ROOT}/setup/build.gradle.patch"
    android update project --target android-19 --name Cheminot --path "${ROOT}/app/platforms/android" --subprojects
    echo "\n------------------------------"
    echo "Patching AndroidManifest.xml"
    echo "------------------------------"
    patch "${ROOT}/app/platforms/android/AndroidManifest.xml" < "${ROOT}/setup/AndroidManifest.xml.patch"
    ndk-build -C "${ROOT}/app/platforms/android"
    tarifa build android

    echo "\n------------------------------"
    echo "Running app in the browser"
    echo "------------------------------"
    tarifa run browser
fi

echo "\nDONE!"
