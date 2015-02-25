#!/bin/bash$

rsync -av ../cheminot.ui/dist/fonts/target/ project/www/fonts/cheminot/
rsync -av ../cheminot.ui/dist/splashscreens/ images/android/default/splashscreens/
rsync -av ../cheminot.ui/dist/icons/ images/android/default/icons/
cp ../cheminot.ui/dist/loader/*.gif project/www/images/
