#!/bin/bash

tarifa build browser demo
cd app/platforms/browser/
zip -r cheminotm.zip www/
scp cheminotm.zip sre@cheminot.org:/home/sre/sites/cheminot.org/app/
rm cheminotm.zip
