cd /Users/aarons/repos/adhdclock

(sleep 7 ; echo "Lanching browser..."; sleep 1 ;open http://localhost:8080) &

until espruino -d "Bangle.js cd9f" --ide; do
    echo "Retrying..."
    sleep 1
done
