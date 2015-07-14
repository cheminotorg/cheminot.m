#!/bin/sh

sh setup/plugin.sh
ndk-build -C app/platforms/android
sh setup/cheminotdb.sh
tarifa build android stage
tarifa hockeyapp version upload android stage -V
