#!/bin/bash$

rsync -av ../../../tools/protobuf/src/google/ src/android/jni/protobuf/google/
rsync -av ../cheminot.c/src/protobuf/ src/android/jni/cheminotc/protobuf/
rsync -av ../cheminot.c/src/fastmktime/ src/android/jni/cheminotc/fastmktime/
cp ../cheminot.c/src/cheminotc.cpp src/android/jni/cheminotc/
cp ../cheminot.c/src/cheminotc.h src/android/jni/cheminotc/
