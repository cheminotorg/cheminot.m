#!/bin/bash

VERSION=$(git describe --long --always)

sh setup/plugin.sh
ndk-build -C app/platforms/android
sh setup/cheminotdb.sh
tarifa build android prod
