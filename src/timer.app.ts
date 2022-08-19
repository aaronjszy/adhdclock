require("Font7x11Numeric7Seg").add(Graphics);

var clockFace = new ClockFace();

function eventAlarmHandler(clockFace: ClockFace, event: CalendarEvent) {
    //eventsObj.selectEvent(event);
    // clockFace.redrawAll(event);
    Bangle.setLCDPower(1);
    Bangle.buzz(1000).then(() => {
        return new Promise(resolve => setTimeout(resolve, 500));
    }).then(()=>{
        return Bangle.buzz(1000);
    }).then(() => {
        return new Promise(resolve => setTimeout(resolve, 500));
    }).then(()=>{
        return Bangle.buzz(1000);
    });
}

var eventsObj = new Events(clockFace, [
//    new CalendarEvent(clockFace, eventAlarmHandler, "test1", new MyDate("2022-08-17T20:40:00 GMT-0600"), new MyDate("2022-08-17T20:50:00 GMT-0600")),
//    new CalendarEvent(clockFace, eventAlarmHandler, "test2", new MyDate("2022-08-17T20:50:00 GMT-0600"), new MyDate("2022-08-17T21:55:00 GMT-0600")),
//    new CalendarEvent(clockFace, eventAlarmHandler, "test3", new MyDate("2022-08-17T20:50:00 GMT-0600"), new MyDate("2022-08-17T21:30:00 GMT-0600")),
//    new CalendarEvent(clockFace, eventAlarmHandler, "test4", new MyDate("2022-08-17T21:35:00 GMT-0600"), new MyDate("2022-08-17T21:50:00 GMT-0600")),
], eventAlarmHandler);
eventsObj.initAlarms();
eventsObj.selectUpcomingEvent();



(new CalendarUpdater(clockFace, eventsObj)).readCalendarDataAndUpdate();

Bangle.setUI("clock");
Bangle.loadWidgets();
clockFace.redrawAll(eventsObj);
var minuteInterval = setInterval(() => {clockFace.redrawAll(eventsObj)}, 60*1000);

setupBangleEvents(clockFace, minuteInterval, eventsObj);
