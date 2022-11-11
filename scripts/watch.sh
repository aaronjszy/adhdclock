cd /Users/aarons/repos/adhdclock

prefix() {
    awk '{ print "    ", $0 }'
}

echo "--Build---------------------------"
./scripts/build.sh 2>&1 | prefix

echo "--Install---------------------------"
until espruino -d "Bangle.js cd9f" -w adhdclock.app.js; do
    echo "Retrying..."
    sleep 1
done

echo "--Done---------------------------"
