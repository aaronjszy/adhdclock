# ADHD Clock

This is banglejs clock face that shows the time relative 
to the next upcoming event. Events are synced from a calendar.

## Build & Install
This project is written in typescript. To build it, run 
`./build.sh` to generate adhdclock.app.js.

```javascript
require("Storage").write("android.calendar.json",[]);

require("Storage").write("adhdclock.info",{
  "id":"adhdclock",
  "name":"ADHD Clock",
  "type":"clock",
  "src":"adhdclock.app.js",
  "icon":"timer.img"
});
```

## TODO
  - When the timer is within x minutes, show seconds
  - Replace EventDate with Date and a custom date class with static methods
  - Use layout instead of what im doing now: https://www.espruino.com/Bangle.js+Layout
  - Add todays date somewhere
  - If all events are in the past, what should we do? Show the time? Create another event?

## Reference
 - https://github.com/espruino/BangleApps/blob/17fde110a269dee8731dfe0733e34e8a5e806247/apps/agenda/settings.js
 - https://www.espruino.com/Typescript+and+Visual+Studio+Code+IDE 
 - https://www.espruino.com/Programming#espruino-command-line-tool
