#!/bin/bash

ROOT=$(pwd)

echo "\n------------------------------"
echo "Patching AndroidManifest.xml"
echo "------------------------------"
patch "${ROOT}/app/platforms/android/AndroidManifest.xml" < "${ROOT}/setup/AndroidManifest.xml.patch"
