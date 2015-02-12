#!/bin/bash$

rsync -av ../m.cheminot.plugin/ app/plugins/m.cheminot.plugin/
rsync -av ../m.cheminot.plugin/src/android/jni/ app/platforms/android/jni/
cp ../m.cheminot.plugin/www/cheminot.js app/platforms/android/assets/www/plugins/m.cheminot.plugin/www/cheminot.js
cp ../m.cheminot.plugin/src/android/m.cheminot.plugin/Cheminot.java app/platforms/android/src/m/cheminot/plugin/Cheminot.java
cp ../m.cheminot.plugin/src/android/m.cheminot.plugin/jni/CheminotLib.java app/platforms/android/src/m/cheminot/plugin/jni/CheminotLib.java
