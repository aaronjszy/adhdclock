source $(dirname $0)/lib.sh

echo "--Build---------------------------"
build 2>&1 | prefix

echo "--Install---------------------------"
upload "adhdclock.app.js" | prefix

echo "--Done---------------------------"
