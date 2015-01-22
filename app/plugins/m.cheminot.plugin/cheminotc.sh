#!/bin/bash$

rsync -av ../../../tools/tmp/protobuf/src/google/ src/android/jni/protobuf/google/
rsync -av ../cheminot.c/src/protobuf/ src/android/jni/cheminotc/protobuf/
cp ../cheminot.c/src/cheminotc.cpp src/android/jni/cheminotc/
cp ../cheminot.c/src/cheminotc.h src/android/jni/cheminotc/
