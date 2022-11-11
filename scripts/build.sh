source $(dirname $0)/lib.sh
gotoprojectroot

rm -rf dist
tsc
rm -rf dist/0bangle.js
uglifyjs -b -o ./adhdclock.app.js ./dist/*
