require("Font7x11Numeric7Seg").add(Graphics);

// BUG: alarms dont work reliably and i dont know why

var alarmManager = new AlarmManager();
var clockInterval = new ClockInterval();
var eventsObj = new CalendarEvents([], alarmManager);

var clockFace = new ClockFace(clockInterval, eventsObj);
eventsObj.setClockFace(clockFace);
eventsObj.addEvent(new CalendarEvent(clockFace, "test1", "testdesc", new MyDate("2022-09-15", "10:55pm"), new MyDate("2022-09-15", "11:00pm")));
eventsObj.initAlarms();
eventsObj.selectUpcomingEvent();

(new CalendarUpdater(clockFace, eventsObj)).readCalendarDataAndUpdate();

Bangle.setUI("clock");
Bangle.loadWidgets();
clockFace.redrawAll();

clockInterval.setTickHandler(() => {
    clockFace.redrawAll();

    //TODO the clockface can tell just the tick handler when to next redraw
    // this is much simpler and should be more reliable
    // when we swipe, the swipe handler can also call this to schedule the next redraw
    // return clockFace.nextRedrawTime();
});
clockInterval.useMinuteInterval();

setupBangleEvents(clockFace, clockInterval, eventsObj);
