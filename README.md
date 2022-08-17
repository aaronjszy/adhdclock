# ADHD Clock

This is banglejs clock face that shows the time relative 
to the next upcoming event. Events are synced from a calendar.

## Build & Install
This project is written in typescript. To build it, run 
`./build.sh` to generate adhdclock.app.js.

```javascript
require("Storage").write("adhdclock.info",{
  "id":"adhdclock",
  "name":"ADHD Clock",
  "type":"clock",
  "src":"adhdclock.app.js",
  "icon":"timer.img"
});
```

## TODO
  - Treat event start AND end as separate "events"
  - Persist event data so we dont lose state when switching apps
  - When the timer is within x minutes, show seconds



## Reference
 - https://github.com/espruino/BangleApps/blob/17fde110a269dee8731dfe0733e34e8a5e806247/apps/agenda/settings.js
 - https://www.espruino.com/Typescript+and+Visual+Studio+Code+IDE 
 - https://www.espruino.com/Programming#espruino-command-line-tool
