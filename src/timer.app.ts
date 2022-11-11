require("Font7x11Numeric7Seg").add(Graphics);

var eventsObj = new CalendarEvents([]).restore();
var clockFace = new ClockFace(eventsObj);

var now = new MyDate();
now.addMinutes(60);
now.floorMinutes();

setTimeout(function() {
    (new CalendarUpdater(clockFace, eventsObj)).readCalendarDataAndUpdate();
}, 10);

if(!eventsObj.hasEvents()) {
    eventsObj.addEvent(new CalendarEvent("next hour", "", now, now));
}

eventsObj.selectUpcomingEvent();

Bangle.setUI("clock");
Bangle.loadWidgets();
Bangle.drawWidgets();
clockFace.redrawAll();

var clockInterval = new ClockInterval();
clockInterval.setTickHandler(() => {
    clockFace.redrawAll();

    //TODO the clockface can tell just the tick handler when to next redraw
    // this is much simpler and should be more reliable
    // when we swipe, the swipe handler can also call this to schedule the next redraw
    // return clockFace.nextRedrawTime();
});
clockInterval.useMinuteInterval();

setupBangleEvents(clockFace, clockInterval, eventsObj);
 
// Put this in ide to send a test message
// GB({"t": "calendar","id": 36,"type": 0,"timestamp": 1665892800,"durationInSeconds": 1800,"title": "Zzz","description": "","location": "","calName": "aaronszymanski@gmail.com/BangleJS","color": -4989844,"allDay": false})
