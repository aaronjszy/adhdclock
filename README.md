
//TODO Read this tutorial to up my game:
// https://www.espruino.com/Typescript+and+Visual+Studio+Code+IDE 

//https://www.espruino.com/Programming#espruino-command-line-tool



// TODOs
// Persist event data so we dont lose state when switching apps
// Break this up into files
// Maybe automatically select the next upcoming event after a timeout, this will give us auto advance and also allow us to peek
//    Is there a use case for wanting to keep some other event selected that is not the upcoming one?
//    I might want to keep an old one up if it has elapsed and im trying to get it done
// support events with a start time and end time, might want to show time remaining in a given event? Maybe treat this as two cards, one for hte start, one for the end
// !!!! Have one progress bar and show the timeline, it will point to the next event but the current events end time will be indicated on the bar
//   What if the next event happens DURING the current event? Not a problem, same policy works, you just wont have the end of meeting indication.
// If two events are scheduled at the same time, show both descriptions, treat them as one card
// When the timer is within 3 minutes, show seconds - will need smarter timer management since we only want to fire the seconds timer when its needed to be kind to the battery
// need to limit desc length so it doesnt push the time out. Or, move the event time beside the current time. start time on left, current in middle, end time on right
// move times on top of progress bar and flip direction that it drains
// When it times out an event, it still says theres 1 minute
// Allow times without dates for daily stuff

// https://github.com/espruino/BangleApps/blob/17fde110a269dee8731dfe0733e34e8a5e806247/apps/agenda/settings.js

/*
require("Storage").write("timer.info",{
  "id":"timer",
  "name":"My Timer",
  "src":"adhd.app.js",
  "icon":"timer.img"
});
require("Storage").write("adhdclock.info",{
  "id":"adhdclock",
  "name":"ADHD Clock",
  "type":"clock",
  "src":"adhdclock.app.js",
  "icon":"timer.img"
});
*/
