#!/bin/bash

echo "\n---------------------"
echo "Installing DB"
echo "---------------------"

rm app/platforms/android/assets/calendardates*
rm app/platforms/android/assets/cheminot*
rm app/platforms/android/assets/stops_ttree*
rm app/platforms/android/assets/graph*

cp ../cheminot.db/db/current/* app/platforms/android/assets/
cp ../cheminot.db/db/current/stops_ttree.json project/www/data/stops_ttree.json

rm app/platforms/android/assets/stops_ttree*

echo "\nDONE!"
