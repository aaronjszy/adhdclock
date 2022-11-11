source $(dirname $0)/lib.sh
gotoprojectroot

echo "--Build---------------------------"
build

echo "--Copy to app loader--------------"
cp adhdclock.app.js ~/repos/BangleApps/apps/adhdclock/app.js 2>&1 | prefix

echo "--Commit changes------------------"
cd ~/repos/BangleApps
git commit -a -m "Update adhdclock/app.js" 2>&1 | prefix

echo "--Push changes-------------------"
git push 2>&1 | prefix

echo "--Done---------------------------"
