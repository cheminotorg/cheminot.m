#!/bin/bash

tarifa build browser demo
cd app/platforms/browser/
zip -r cheminotm.zip www/
dropbox_uploader.sh -p upload cheminotm.zip cheminotm-latest.zip
dropbox_uploader.sh share cheminotm-latest.zip
