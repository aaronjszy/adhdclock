source $(dirname $0)/lib.sh

(sleep 7 ; echo "Lanching browser..."; sleep 1 ;open http://localhost:8080) &

retry espruino -d "Bangle.js cd9f" --ide