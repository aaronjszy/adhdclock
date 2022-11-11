source $(dirname $0)/lib.sh

echo "--Build---------------------------"
build

echo "--Install---------------------------"
uploadandwatch "adhdclock.app.js"

echo "--Done---------------------------"
