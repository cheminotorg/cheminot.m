#!/bin/bash

tarifa build browser demo --mode=prod
cd app/platforms/browser/
zip -r cheminotm.zip www/
dropbox_uploader.sh -p upload cheminotm.zip cheminotm-latest.zip
dropbox_uploader.sh share cheminotm-latest.zip
rm version
git describe --long --always > version
dropbox_uploader.sh -p upload version cheminotm_version
