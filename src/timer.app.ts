import { ClockFace } from './clockface';
import { CalendarUpdater } from './calendarupdate';
import { EventDate } from "./date";
import { CalendarEvents } from './calendarevents';
import { setupBangleEvents } from './bangleevents';
import { reportEvent } from './util';

function main() {
    reportEvent("--app started-----");

    var eventsObj = new CalendarEvents([]).restore();
    var clockFace = new ClockFace(eventsObj);

    var originalGB = global.GB;
    global.GB = function(j: any) {
      switch (j.t) {
        case "calendar":
            reportEvent("+" + j.id + ": " + j.title + " " + new EventDate(j.timestamp*1000).string());
            eventsObj.addCalendarEvent(j);
            eventsObj.organize();
            clockFace.redrawAll();
            break;
        case "calendar-":
            reportEvent("-" + j.id);
            eventsObj.removeCalendarEvent(j.id);
            eventsObj.organize();
            clockFace.redrawAll();
            break;
      }
      
      if (originalGB) originalGB(j);
    };

    setTimeout(function() {
        (new CalendarUpdater(clockFace, eventsObj)).readCalendarDataAndUpdate();
    }, 1000*10); // After 10 seconds

    setInterval(function() {
        (new CalendarUpdater(clockFace, eventsObj)).readCalendarDataAndUpdate();
    }, 1000*60*60) // Hourly

    eventsObj.selectUpcomingEvent();

    Bangle.setUI("clock");
    Bangle.loadWidgets();
    Bangle.drawWidgets();
    clockFace.redrawAll();

    setupBangleEvents(clockFace, eventsObj);

    // Put this in ide to send a test message
    // GB({"t": "calendar","id": 1234,"type": 0,"timestamp": Math.floor(new Date().getTime()/1000)+65,"durationInSeconds": 1800,"title": "Test","description": "","allDay": false})
    // GB({"t": "calendar-","id": 1234})
}

main();
