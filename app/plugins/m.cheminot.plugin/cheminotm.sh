#!/bin/bash$

rsync -av ../cheminot.m/app/platforms/android/jni/ src/android/jni/
cp ../cheminot.m/app/plugins/m.cheminot.plugin/www/cheminot.js www/cheminot.js
cp ../cheminot.m/app/platforms/android/src/m/cheminot/plugin/Cheminot.java src/android/m.cheminot.plugin/Cheminot.java
cp ../cheminot.m/app/platforms/android/src/m/cheminot/plugin/jni/CheminotLib.java src/android/m.cheminot.plugin/jni/CheminotLib.java
