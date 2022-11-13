source $(dirname $0)/lib.sh

echo "--Build---------------------------"
build 2>&1 | prefix

echo "--Install---------------------------"
upload "adhdclock.app.js" | prefix

# Is there a faster way to upload multiple files? Can we stay connected?
# Is there a difference between storage and disk? the espruino cli docs make it sound like it.
# WHen using modules the espruino tool should search for and upload the necesary modules apparently
# https://forum.espruino.com/conversations/324353/

echo "--Done---------------------------"
