#!/bin/bash

echo "\n---------------------"
echo "Installing DB"
echo "---------------------"

cp "../cheminot.db/db/current/cheminot.db" app/platforms/android/assets/
cp "../cheminot.db/db/current/calendar_dates" app/platforms/android/assets/
cp "../cheminot.db/db/current/graph" app/platforms/android/assets/

echo "\nDONE!"
