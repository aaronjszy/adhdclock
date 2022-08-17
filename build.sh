rm -rf dist
tsc
rm -rf dist/0bangle.js
uglifyjs -b -o ./adhdclock.app.js ./dist/*
