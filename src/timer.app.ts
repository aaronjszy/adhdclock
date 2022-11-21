import { ClockFace } from './clockface';
import { CalendarUpdater } from './calendarupdate';
import { EventDate } from "./date";
import { CalendarEvents } from './calendarevents';
import { setupBangleEvents } from './bangleevents';
import { reportEvent } from './util';

(function() {
    var originalGB = global.GB;
    global.GB = function(j: any) {
      switch (j.t) {
        case "calendar":
            reportEvent("+" + j.id + ": " + j.title + " " + new EventDate(j.timestamp*1000).string());
            break;
        case "calendar-":
            reportEvent("-" + j.id);
            break;
        case "calendarevents":
            reportEvent("calendarevents: " + JSON.stringify(j.events, undefined, undefined));
            break;
        case "force_calendar_sync_start":
            reportEvent("force_calendar_sync_start");
            break;
      }
      
      if (originalGB) originalGB(j);
    };
})();

function main() {
    reportEvent("--app started-----");

    var eventsObj = new CalendarEvents([]).restore();
    // var testevent = new CalendarEvent("test", "", new EventDate("2022-11-19", "05:13pm"), new EventDate("2022-11-19", "5:30pm"))
    // eventsObj.addEvent(testevent);

    var clockFace = new ClockFace(eventsObj);

    setTimeout(function() {
        (new CalendarUpdater(clockFace, eventsObj)).readCalendarDataAndUpdate();
    }, 10);

    eventsObj.selectUpcomingEvent();

    Bangle.setUI("clock");
    Bangle.loadWidgets();
    Bangle.drawWidgets();
    clockFace.redrawAll();

    setupBangleEvents(clockFace, eventsObj);

    // Put this in ide to send a test message
    // GB({"t": "calendar","id": 36,"type": 0,"timestamp": 1665892800,"durationInSeconds": 1800,"title": "Zzz","description": "","location": "","calName": "aaronszymanski@gmail.com/BangleJS","color": -4989844,"allDay": false})
}

main();