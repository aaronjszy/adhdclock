import { ClockFace } from './clockface';
import { CalendarUpdater } from './calendarupdate';
import { MyDate } from "./date";
import { CalendarEvents, CalendarEvent } from './calendarevents';
import { setupBangleEvents } from './bangleevents';

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

setupBangleEvents(clockFace, eventsObj);

// Put this in ide to send a test message
// GB({"t": "calendar","id": 36,"type": 0,"timestamp": 1665892800,"durationInSeconds": 1800,"title": "Zzz","description": "","location": "","calName": "aaronszymanski@gmail.com/BangleJS","color": -4989844,"allDay": false})
