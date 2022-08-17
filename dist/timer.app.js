require("Font7x11Numeric7Seg").add(Graphics);
var clockFace = new ClockFace();
function eventAlarmHandler(clockFace, event) {
    //eventsObj.selectEvent(event);
    // clockFace.redrawAll(event);
    Bangle.setLCDPower(1);
    Bangle.buzz(1000).then(function () {
        return new Promise(function (resolve) { return setTimeout(resolve, 500); });
    }).then(function () {
        return Bangle.buzz(1000);
    }).then(function () {
        return new Promise(function (resolve) { return setTimeout(resolve, 500); });
    }).then(function () {
        return Bangle.buzz(1000);
    });
}
var eventsObj = new Events(clockFace, [
// new CalendarEvent(clockFace, eventAlarmHandler, "test", new MyDate("2022-08-17T08:37:00 GMT-0600"), new MyDate("2022-08-17T08:38:00 GMT-0600"))
], eventAlarmHandler);
eventsObj.sortEvents();
eventsObj.initAlarms();
eventsObj.selectUpcomingEvent();
(new CalendarUpdater(clockFace, eventsObj)).readCalendarDataAndUpdate();
Bangle.setUI("clock");
Bangle.loadWidgets();
clockFace.redrawAll(eventsObj);
var minuteInterval = setInterval(function () { clockFace.redrawAll(eventsObj); }, 60 * 1000);
setupBangleEvents(clockFace, minuteInterval, eventsObj);
