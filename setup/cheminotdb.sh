#!/bin/bash

echo "\n---------------------"
echo "Installing DB"
echo "---------------------"

rm app/platforms/android/assets/calendar_dates*
rm app/platforms/android/assets/cheminot*
rm app/platforms/android/assets/stops_ttree*
rm app/platforms/android/assets/graph*

cp ../cheminot.db/db/current/* app/platforms/android/assets/

rm app/platforms/android/assets/stops_ttree*

echo "\nDONE!"
