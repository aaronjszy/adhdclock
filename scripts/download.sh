cd /Users/aarons/repos/adhdclock

mkdir -p storage

until espruino -d "Bangle.js cd9f" --download "adhdclock.events"; do
    echo "Retrying..."
    sleep 1
done
cat "adhdclock.events" | jq . | sponge "adhdclock.events"
mv adhdclock.events storage/adhdclock.events.json

until espruino -d "Bangle.js cd9f" --download "android.calendar.json"; do
    echo "Retrying..."
    sleep 1
done
cat "android.calendar.json" | jq . | sponge "android.calendar.json"
mv android.calendar.json storage/android.calendar.json
