import { ClockFace } from './clockface';
import { CalendarEvents } from './calendarevents';
import { setupBangleEvents } from './bangleevents';
import { reportEvent } from './util';

function main() {
    reportEvent("--app started-----");

    var eventsObj = new CalendarEvents([]).restore();
    var clockFace = new ClockFace(eventsObj);

    setupBangleEvents(clockFace, eventsObj);

    eventsObj.selectUpcomingEvent();

    Bangle.setUI("clock");
    Bangle.loadWidgets();
    Bangle.drawWidgets();
    clockFace.redrawAll();

    // Put this in ide to send a test message
    // GB({"t": "calendar","id": 1234,"type": 0,"timestamp": Math.floor(new Date().getTime()/1000)+65,"durationInSeconds": 1800,"title": "Test","description": "","allDay": false})
    // GB({"t": "calendar-","id": 1234})
}

main();
