require("Font7x11Numeric7Seg").add(Graphics);

var alarmManager = new AlarmManager();
var clockInterval = new ClockInterval();
var eventsObj = new CalendarEvents([], alarmManager);

// TODO This is gross, I should make calendarevents not require eventsobj.
var clockFace = new ClockFace(clockInterval, eventsObj);
eventsObj.setClockFace(clockFace);

eventsObj.addEvent(new CalendarEvent(clockFace, "test1", "testdesc", new MyDate("2022-09-14", "5:00pm"), new MyDate("2022-09-14", "5:15pm")));

eventsObj.initAlarms();
eventsObj.selectUpcomingEvent();

(new CalendarUpdater(clockFace, eventsObj)).readCalendarDataAndUpdate();

Bangle.setUI("clock");
Bangle.loadWidgets();
clockFace.redrawAll();

clockInterval.setTickHandler(() => {
    clockFace.redrawAll();
});
clockInterval.useSecondInterval();

setupBangleEvents(clockFace, clockInterval, eventsObj);
