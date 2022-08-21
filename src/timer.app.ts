require("Font7x11Numeric7Seg").add(Graphics);

var clockFace = new ClockFace();

var alarmManager = new AlarmManager();
var eventsObj = new CalendarEvents(clockFace, [], alarmManager);
eventsObj.addEvent(new CalendarEvent(clockFace, "test1", new MyDate("2022-08-20", "5:32pm"), new MyDate("2022-08-20", "5:34pm")));
eventsObj.initAlarms();
eventsObj.selectUpcomingEvent();

(new CalendarUpdater(clockFace, eventsObj)).readCalendarDataAndUpdate();

Bangle.setUI("clock");
Bangle.loadWidgets();
clockFace.redrawAll(eventsObj);
var minuteInterval = setInterval(() => {clockFace.redrawAll(eventsObj)}, 60*1000);

setupBangleEvents(clockFace, minuteInterval, eventsObj);
