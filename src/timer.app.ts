require("Font7x11Numeric7Seg").add(Graphics);

var alarmManager = new AlarmManager();
var clockInterval = new ClockInterval();
var eventsObj = new CalendarEvents([], alarmManager);

// TODO This is gross, I should make calendarevents not require eventsobj.
var clockFace = new ClockFace(clockInterval, eventsObj);
eventsObj.setClockFace(clockFace);

// eventsObj.addEvent(new CalendarEvent(clockFace, "test1", "testdesc", new MyDate("2022-08-20", "5:32pm"), new MyDate("2022-08-20", "5:34pm")));
eventsObj.initAlarms();
eventsObj.selectUpcomingEvent();

(new CalendarUpdater(clockFace, eventsObj)).readCalendarDataAndUpdate();

Bangle.setUI("clock");
Bangle.loadWidgets();
clockFace.redrawAll();

clockInterval.setTickHandler(() => {
    clockFace.redrawAll();
});
clockInterval.useMinuteInterval();

setupBangleEvents(clockFace, clockInterval, eventsObj);
