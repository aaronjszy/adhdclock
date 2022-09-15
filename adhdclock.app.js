"use strict";

class RawComponent {
    constructor() {
        this.name = "";
        this.properties = [];
        this.components = [];
    }
}

class TimezoneComponent {
    constructor(component) {
        this.component = component;
    }
}

class EventComponent {
    constructor(component) {
        this.component = component;
    }
}

class UnsupportedComponent {
    constructor(component) {
        this.component = component;
    }
}

class Calendar {
    constructor(events, timezones, unsupported) {
        this.events = events;
        this.timezones = timezones;
        this.unsupported = unsupported;
    }
}

function parseComponent(lines, i) {
    var rawComponent = new RawComponent();
    rawComponent.name = lines[i].substring(6);
    rawComponent.properties = [];
    rawComponent.components = [];
    i++;
    while (lines[i].indexOf("END:" + rawComponent.name) !== 0) {
        if (lines[i].indexOf("BEGIN:") === 0) {
            rawComponent.components.push(parseComponent(lines, i));
        } else {
            rawComponent.properties.push(lines[i]);
        }
        i++;
    }
    var component = {};
    if (rawComponent.name === "VEVENT") {
        component = new EventComponent(rawComponent);
    } else if (rawComponent.name === "VTIMEZONE") {
        component = new TimezoneComponent(rawComponent);
    } else {
        component = new UnsupportedComponent(rawComponent);
    }
    return component;
}

function parseICal(data) {
    var lines = data.split("\r\n");
    var events = [];
    var timezones = [];
    var unsupported = [];
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.indexOf("BEGIN:") === 0) {
            var component = parseComponent(lines, i);
            if (component.name === "VEVENT") {
                events.push(component);
            } else if (component.name === "VTIMEZONE") {
                timezones.push(component);
            } else {
                unsupported.push(component);
            }
        }
    }
    return new Calendar(events, timezones, unsupported);
}

"use strict";

class Alarm {
    constructor(id, date, callback) {
        this.id = id;
        this.date = date;
        this.callback = callback;
        this.timeout = undefined;
    }
    setup() {
        this.cancel();
        this.timeout = setTimeout(() => {
            this.callback();
        }, this.date.getTime() - new Date().getTime());
        return this;
    }
    cancel() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }
    toString() {
        return `${this.id} '${this.date}'`;
    }
}

class AlarmManager {
    constructor() {
        this.alarms = {};
    }
    addAlarm(id, date, callback) {
        if (this.alarms[id]) {
            this.alarms[id].cancel();
        }
        this.alarms[id] = new Alarm(id, date, callback).setup();
        return this.alarms[id];
    }
    toString() {
        var s = "";
        for (var id in this.alarms) {
            s += this.alarms[id].toString() + "\n";
        }
        return s;
    }
}

"use strict";

function fillLine(x1, y1, x2, y2, lineWidth) {
    var dx, dy, d;
    lineWidth = (lineWidth - 1) / 2;
    dx = x2 - x1;
    dy = y2 - y1;
    d = Math.sqrt(dx * dx + dy * dy);
    dx = Math.round(dx * lineWidth / d);
    dy = Math.round(dy * lineWidth / d);
    g.fillPoly([ x1 + dx, y1 - dy, x1 - dx, y1 + dy, x2 - dx, y2 + dy, x2 + dx, y2 - dy ]);
}

"use strict";

function zeroPad(n) {
    return ("0" + n.toString()).substr(-2);
}

"use strict";

class MyDate {
    constructor(dateStr, timeStr) {
        if (timeStr) {
            let timeParts = timeStr.split(":");
            let hourStr = timeParts[0] == "12" ? "0" : timeParts[0];
            if (timeStr.endsWith("pm")) {
                hourStr = zeroPad(parseInt(hourStr) + 12);
            } else {
                hourStr = zeroPad(parseInt(hourStr));
            }
            let minStr = timeParts[1];
            if (minStr.length > 2) {
                minStr = minStr.substr(0, 2);
            }
            let tzStr = "-" + zeroPad(new Date().getTimezoneOffset() / 60) + "00";
            this.date = new Date(`${dateStr}T${hourStr}:${minStr}:00 GMT${tzStr}`);
        } else {
            this.date = dateStr ? new Date(dateStr) : new Date();
        }
    }
    valueOf() {
        return this.date;
    }
    formattedTime() {
        var hours12 = this.date.getHours() % 12;
        hours12 = hours12 == 0 ? 12 : hours12;
        var paddedMinute = zeroPad(this.date.getMinutes());
        return `${hours12}:${paddedMinute}`;
    }
    formattedDate() {
        var month = require("locale").month(this.date, 1);
        var dayOfMonth = this.date.getDate();
        return `${month} ${dayOfMonth}`;
    }
    formattedDateTime() {
        return `${this.formattedDate()} ${this.formattedTime()}`;
    }
    unixTimestampMillis() {
        return this.date.getTime();
    }
    millisUntil() {
        var now = new Date();
        return this.date.getTime() - now.getTime();
    }
    secondsUntil() {
        var now = new Date();
        return (this.date.getTime() - now.getTime()) / 1e3 + 1;
    }
    minutesUntil() {
        var now = new Date();
        return (this.date.getTime() - now.getTime()) / 1e3 / 60 + 1;
    }
    timeRemainingAsString() {
        var secondsUntil = this.secondsUntil();
        var sign = secondsUntil < 0 ? "-" : "";
        var secondsUntilAbs = Math.abs(secondsUntil);
        var totalMinutesToEventAbs = Math.floor(secondsUntilAbs / 60);
        var hoursToEventAbs = Math.floor(totalMinutesToEventAbs / 60);
        var minutesToEventAbs = totalMinutesToEventAbs % 60;
        if (hoursToEventAbs == 0) {
            return `${sign}${minutesToEventAbs}`;
        } else {
            return `${sign}${hoursToEventAbs}:${zeroPad(minutesToEventAbs)}`;
        }
    }
    secondsRemainingAsString() {
        var secondsUntil = this.secondsUntil();
        var secondsUntilAbs = Math.abs(secondsUntil);
        var secondsDisplay = zeroPad(Math.floor(secondsUntilAbs % 60));
        return `${secondsDisplay}`;
    }
    equals(other) {
        return this.date.getTime() == other.date.getTime();
    }
}

"use strict";

var TrackedEventBoundary;

(function(TrackedEventBoundary) {
    TrackedEventBoundary[TrackedEventBoundary["START"] = 0] = "START";
    TrackedEventBoundary[TrackedEventBoundary["END"] = 1] = "END";
})(TrackedEventBoundary || (TrackedEventBoundary = {}));

class CalendarEvent {
    constructor(clockFace, name, description, startTime, endTime) {
        this.alarmHandler = () => {};
        this.id = `${name}/${new Date().getTime().toString()}`;
        this.clockFace = clockFace;
        this.name = name;
        this.description = description;
        this.startTime = startTime;
        this.endTime = endTime;
        this.skipped = false;
        this.bangleCalendarEventId = undefined;
        this.trackedEventBoundary = TrackedEventBoundary.END;
    }
    setAlarmHandler(alarmHandler) {
        this.alarmHandler = alarmHandler;
    }
    update(event) {
        if (event.bangleCalendarEventId != this.bangleCalendarEventId) {
            return false;
        }
        event.id = this.id;
        event.clockFace = this.clockFace;
        event.bangleCalendarEventId = this.bangleCalendarEventId;
        event.skipped = this.skipped;
        event.trackedEventBoundary = this.trackedEventBoundary;
        event.alarmHandler = this.alarmHandler;
        var isModified = JSON.stringify(event) != JSON.stringify(this);
        this.name = event.name;
        this.description = event.description;
        this.startTime = event.startTime;
        this.endTime = event.endTime;
        return isModified;
    }
    setBangleCalendarEventId(bangleCalendarEventId) {
        this.bangleCalendarEventId = bangleCalendarEventId;
    }
    toggleSkip() {
        this.skipped = !this.skipped;
        return this.skipped;
    }
    toggleTrackedEventBoundary() {
        this.trackedEventBoundary = this.trackedEventBoundary == TrackedEventBoundary.END ? TrackedEventBoundary.START : TrackedEventBoundary.END;
    }
    getTrackedEventBoundary() {
        return this.trackedEventBoundary;
    }
    getTrackedEventDate() {
        if (this.trackedEventBoundary == TrackedEventBoundary.START) {
            return this.startTime;
        }
        return this.endTime;
    }
    initAlarms(alarmManager) {
        alarmManager.addAlarm(this.id + "/start", this.startTime.date, () => {
            if (!this.skipped && this.startTime.millisUntil() > 0) {
                this.alarmHandler(this.clockFace, this);
            }
        });
        alarmManager.addAlarm(this.id + "/end", this.endTime.date, () => {
            if (!this.skipped && this.endTime.millisUntil() > 0) {
                this.alarmHandler(this.clockFace, this);
            }
        });
    }
    displayName() {
        return this.name.substr(0, 14);
    }
    displayDescription() {
        if (this.description.length == 0) {
            return "empty";
        }
        if (this.displayDescription.length > 50) {
            return this.description.substr(0, 50) + "...";
        }
        return this.description;
    }
    displayTimeRemaining() {
        return this.getTrackedEventDate().timeRemainingAsString();
    }
    displaySecondsRemaining() {
        return this.getTrackedEventDate().secondsRemainingAsString();
    }
    durationMinutes() {
        var durationMillis = this.endTime.unixTimestampMillis() - this.startTime.unixTimestampMillis();
        return durationMillis / 1e3 / 60;
    }
}

class CalendarEvents {
    constructor(events, alarmManager) {
        this.clockFace = new ClockFace(new ClockInterval(), this);
        this.selectedEvent = 0;
        this.events = events;
        this.alarmManager = alarmManager;
        this.refocusTimeout = undefined;
    }
    setClockFace(clockFace) {
        this.clockFace = clockFace;
    }
    eventAlarmHandler(event) {
        this.selectEvent(event);
        this.clockFace.redrawAll();
        Bangle.setLCDPower(1);
        Bangle.buzz(1e3).then(() => {
            return new Promise(resolve => setTimeout(resolve, 500));
        }).then(() => {
            return Bangle.buzz(1e3);
        }).then(() => {
            return new Promise(resolve => setTimeout(resolve, 500));
        }).then(() => {
            return Bangle.buzz(1e3);
        });
    }
    updateFromCalendar(calendar) {
        var updated = 0;
        var now = new Date();
        var maxEventTimeOffset = 1e3 * 60 * 60 * 24;
        for (var i = 0; i < calendar.length; i++) {
            var calendarEvent = calendar[i];
            var calStartEventTimeMillis = calendarEvent.timestamp * 1e3;
            var calEndEventTimeMillis = (calendarEvent.timestamp + calendarEvent.durationInSeconds) * 1e3;
            if (calEndEventTimeMillis > now.getTime() + maxEventTimeOffset || calEndEventTimeMillis < now.getTime() - maxEventTimeOffset) {
                continue;
            }
            if (calendarEvent.title == "" || calendarEvent.t != "calendar" || calendarEvent.allDay || calendarEvent.durationInSeconds == 86400 || calendarEvent.type != 0) {
                continue;
            }
            var newEvent = new CalendarEvent(this.clockFace, calendarEvent.title, calendarEvent.description, new MyDate(calStartEventTimeMillis), new MyDate(calEndEventTimeMillis));
            newEvent.setAlarmHandler(() => {
                this.eventAlarmHandler(newEvent);
            });
            newEvent.setBangleCalendarEventId(calendarEvent.id);
            if (this.addEvent(newEvent)) {
                updated++;
            }
        }
        this.sortEvents();
        this.selectUpcomingEvent();
        this.initAlarms();
        return updated;
    }
    addEvent(event) {
        event.setAlarmHandler(() => {
            this.eventAlarmHandler(event);
        });
        for (var i = 0; i < this.events.length; i++) {
            var e = this.events[i];
            if (e.bangleCalendarEventId == event.bangleCalendarEventId) {
                return e.update(event);
            }
        }
        this.events.push(event);
        return true;
    }
    sortEvents() {
        this.events = this.events.sort((e1, e2) => {
            return e1.endTime.unixTimestampMillis() - e2.endTime.unixTimestampMillis();
        });
    }
    initAlarms() {
        for (var i = 0; i < this.events.length; i++) {
            var e = this.events[i];
            e.initAlarms(this.alarmManager);
        }
    }
    selectEvent(event) {
        for (var i = 0; i < this.events.length; i++) {
            var e = this.events[i];
            if (e == event) {
                this.selectedEvent = i;
                return this.getSelectedEvent();
            }
        }
        return this.getSelectedEvent();
    }
    getUpcomingEventIndex() {
        var soonestEventSeconds = Number.MAX_VALUE;
        var soonestEventIndex = this.events.length - 1;
        for (var i = 0; i < this.events.length; i++) {
            var e = this.events[i];
            var nextEventSeconds = e.endTime.secondsUntil();
            if (!e.skipped && nextEventSeconds >= 0 && nextEventSeconds < soonestEventSeconds) {
                soonestEventSeconds = e.endTime.secondsUntil();
                soonestEventIndex = i;
            }
        }
        return soonestEventIndex;
    }
    selectUpcomingEvent() {
        this.selectedEvent = this.getUpcomingEventIndex();
        return this.getSelectedEvent();
    }
    selectNextEvent() {
        if (this.selectedEvent < this.events.length - 1) {
            this.selectedEvent++;
        }
        this.setRefocusTimeout();
        return this.getSelectedEvent();
    }
    selectPreviousEvent() {
        if (this.selectedEvent > 0) {
            this.selectedEvent--;
        }
        this.setRefocusTimeout();
        return this.getSelectedEvent();
    }
    getSelectedEvent() {
        return this.events[this.selectedEvent];
    }
    setRefocusTimeout() {
        this.clearRefocusTimeout();
        this.refocusTimeout = setTimeout(() => {
            var e = this.selectUpcomingEvent();
            this.clearRefocusTimeout();
            this.clockFace.redrawAll();
        }, 5e3);
    }
    clearRefocusTimeout() {
        if (this.refocusTimeout) {
            clearTimeout(this.refocusTimeout);
        }
        this.refocusTimeout = undefined;
    }
}

"use strict";

class CalendarUpdater {
    constructor(clockFace, events) {
        this.clockFace = clockFace;
        this.events = events;
    }
    forceCalendarUpdate() {
        var cal = require("Storage").readJSON("android.calendar.json", true) || [];
        if (NRF.getSecurityStatus().connected) {
            E.showPrompt("Do you want to also clear the internal database first?", {
                buttons: {
                    Yes: 1,
                    No: 2,
                    Cancel: 3
                }
            }).then(v => {
                switch (v) {
                  case 1:
                    require("Storage").writeJSON("android.calendar.json", []);
                    cal = [];

                  case 2:
                    this.gbSend(JSON.stringify({
                        t: "force_calendar_sync",
                        ids: cal.map(e => e.id)
                    }));
                    E.showAlert("Request sent to the phone").then(() => {
                        this.readCalendarDataAndUpdate();
                        this.clockFace.redrawAll();
                    });
                    break;

                  case 3:
                  default:
                    this.readCalendarDataAndUpdate();
                    this.clockFace.redrawAll();
                    return;
                }
            });
        } else {
            E.showAlert("You are not connected").then(() => {
                this.clockFace.redrawAll();
            });
        }
    }
    gbSend(message) {
        Bluetooth.println("");
        Bluetooth.println(JSON.stringify(message));
    }
    readCalendarDataAndUpdate() {
        var calendarJSON = require("Storage").readJSON("android.calendar.json", true);
        if (!calendarJSON) {
            E.showAlert("No calendar data found.").then(() => {
                E.showAlert().then(() => {
                    this.clockFace.redrawAll();
                });
            });
            return;
        } else {
            var updateCount = this.events.updateFromCalendar(calendarJSON);
            E.showAlert("Got calendar data. Updated " + updateCount + ".").then(() => {
                E.showAlert().then(() => {
                    this.clockFace.redrawAll();
                });
            });
        }
    }
}

"use strict";

class ClockFace {
    constructor(clockInterval, eventsObj) {
        this.clockInterval = clockInterval;
        this.eventsObj = eventsObj;
    }
    redrawAll() {
        g.clearRect({
            x: 0,
            y: 24,
            x2: g.getHeight(),
            y2: g.getWidth()
        });
        this.draw();
    }
    draw() {
        var now = new MyDate();
        var e = this.eventsObj.getSelectedEvent();
        if (!e) {
            E.showMessage("No events.");
            return;
        }
        var showSeconds = Math.abs(e.getTrackedEventDate().minutesUntil()) < 10;
        var X = 176 * .5;
        var Y = 176 * .75;
        g.reset();
        g.setFontAlign(0, 1);
        g.setFont("Vector", 20);
        g.drawString(e.displayName(), X, Y - 60, false);
        g.setFont("Vector", 40);
        var timeRemaining = e.displayTimeRemaining();
        var strMetrics = g.stringMetrics(timeRemaining);
        g.drawString(timeRemaining, X, Y, false);
        if (showSeconds) {
            g.setFont("Vector", 25);
            g.setFontAlign(-1, 1);
            g.drawString(e.displaySecondsRemaining(), X + strMetrics.width / 2 + 3, Y - 3, false);
        }
        var leftTime = now.formattedTime();
        var rightTime = e.getTrackedEventDate().formattedTime();
        var midTime = e.startTime.formattedTime() + "/";
        if (midTime == rightTime || e.getTrackedEventBoundary() == TrackedEventBoundary.START) {
            midTime = "";
        }
        require("FontDennis8").add(Graphics);
        g.setFont("Dennis8", 2);
        g.setFontAlign(-1, 1);
        g.drawString(leftTime, 5, g.getHeight() - 2, true);
        g.setFontAlign(1, 1);
        g.drawString(midTime + rightTime, g.getWidth() - 5, g.getHeight() - 2, true);
        new Meter(e).draw();
        if (e.skipped) {
            fillLine(0, 25, g.getWidth(), g.getHeight(), 3);
            fillLine(g.getWidth(), 25, 0, g.getHeight(), 3);
        }
    }
}

class Meter {
    constructor(event) {
        this.minutesPerSegment = 30;
        this.maxSegmentCount = 10;
        this.eventStart = event.startTime.date;
        this.eventEnd = event.endTime.date;
        this.segmentCountInt = this.segmentCount(event);
        this.maxMinutesInMeter = this.segmentCountInt * this.minutesPerSegment;
        this.meterStartTime = new Date(event.getTrackedEventDate().date.getTime() + -this.maxMinutesInMeter * 6e4);
        this.meterEndTime = event.getTrackedEventDate().date;
        this.padding = 5;
        this.height = 22;
        this.meterTopOffsetPos = g.getHeight() * .73;
        this.maxMeterWidth = g.getWidth() - this.padding * 2;
    }
    segmentCount(event) {
        var eventDuration = event.durationMinutes();
        var eventSegmentCount = Math.ceil(eventDuration / this.minutesPerSegment);
        if (eventSegmentCount > this.maxSegmentCount) {
            eventSegmentCount = this.maxSegmentCount;
        }
        var segmentCount = Math.ceil(event.getTrackedEventDate().minutesUntil() / this.minutesPerSegment);
        if (segmentCount <= 1) {
            segmentCount = 1;
        }
        if (segmentCount > this.maxSegmentCount) {
            segmentCount = this.maxSegmentCount;
        }
        return Math.max(eventSegmentCount, segmentCount);
    }
    draw() {
        var originalColor = g.getColor();
        g.setColor("#00FF00");
        this.drawMeterFill(this.meterStartTime, this.meterEndTime);
        g.setColor("#2c007d");
        this.drawMeterFill(this.eventStart, this.eventEnd);
        g.setColor("#FF0000");
        this.drawMeterFill(this.meterStartTime, new Date());
        if (this.meterStartTime.getTime() < this.eventStart.getTime() && this.eventStart.getTime() < this.meterEndTime.getTime()) {
            g.setColor("#00FF00");
            let eventStartXPos = this.dateToXPos(this.eventStart);
            g.fillPoly([ eventStartXPos, this.meterTopOffsetPos, eventStartXPos, this.meterTopOffsetPos + this.height, eventStartXPos + this.height / 2, this.meterTopOffsetPos + this.height / 2 ]);
            g.drawLine(eventStartXPos, this.meterTopOffsetPos, eventStartXPos, this.meterTopOffsetPos + this.height);
        }
        g.setColor("#000000");
        g.drawRect({
            x: this.padding,
            y: this.meterTopOffsetPos,
            h: this.height,
            w: this.maxMeterWidth
        });
        g.drawRect({
            x: this.padding + 1,
            y: this.meterTopOffsetPos + 1,
            h: this.height - 2,
            w: this.maxMeterWidth - 2
        });
        var segmentWidth = this.maxMeterWidth / this.segmentCountInt;
        for (var i = 1; i <= this.segmentCountInt; i++) {
            var x = this.padding + segmentWidth * i;
            fillLine(x, this.meterTopOffsetPos, x, this.meterTopOffsetPos + this.height, 2);
        }
        g.setColor(originalColor);
    }
    drawMeterFill(startDate, endDate) {
        var startXPos = this.dateToXPos(startDate);
        var endXPos = this.dateToXPos(endDate);
        if (startXPos == endXPos) {
            return;
        }
        g.fillRect(startXPos, this.meterTopOffsetPos, endXPos, this.meterTopOffsetPos + this.height);
    }
    dateToXPos(date) {
        var minute = (date.getTime() - this.meterStartTime.getTime()) / 1e3 / 60;
        var percentage = minute / this.maxMinutesInMeter;
        if (percentage < 0) {
            percentage = 0;
        }
        if (percentage > 1) {
            percentage = 1;
        }
        var maxMeterWidth = g.getWidth() - this.padding * 2;
        return maxMeterWidth * percentage + this.padding;
    }
}

"use strict";

function setupBangleEvents(clockFace, clockInterval, eventsObj) {
    Bangle.on("swipe", function(directionLR, directionUD) {
        if (directionLR == -1 && directionUD == 0) {
            eventsObj.selectNextEvent();
            clockFace.redrawAll();
        }
        if (directionLR == 1 && directionUD == 0) {
            eventsObj.selectPreviousEvent();
            clockFace.redrawAll();
        }
        if (directionUD == -1 && directionLR == 0) {
            var e = eventsObj.getSelectedEvent();
            var skipped = e.toggleSkip();
            clockFace.redrawAll();
            if (skipped) {
                setTimeout(() => {
                    eventsObj.selectUpcomingEvent();
                    clockFace.redrawAll();
                }, 200);
            }
        }
        if (directionUD == 1 && directionLR == 0) {
            new CalendarUpdater(clockFace, eventsObj).forceCalendarUpdate();
        }
    });
    var ignoreTouch = false;
    Bangle.on("touch", function(button, xy) {
        if (ignoreTouch) {
            return;
        }
        if (xy.y > g.getHeight() - 50) {
            eventsObj.getSelectedEvent().toggleTrackedEventBoundary();
            clockFace.redrawAll();
        } else if (xy.y > 50) {
            ignoreTouch = true;
            setTimeout(() => {
                E.showPrompt(eventsObj.getSelectedEvent().displayDescription(), {
                    buttons: {
                        Ok: 1
                    }
                }).then(() => {
                    ignoreTouch = false;
                    clockFace.redrawAll();
                });
            }, 200);
        }
    });
    Bangle.on("lcdPower", on => {
        clockInterval.disableMinuteInterval();
        if (on) {
            clockInterval.enableMinuteInterval();
            clockFace.redrawAll();
        }
    });
}

"use strict";

class ClockInterval {
    constructor() {
        this.tickHandler = () => {};
        this.minuteIntervalEnabled = false;
        this.secondIntervalEnabled = false;
    }
    setTickHandler(tickHandler) {
        this.tickHandler = tickHandler;
    }
    enableMinuteInterval() {
        this.minuteIntervalEnabled = true;
        if (this.minuteTimeout) {
            return;
        }
        this.scheduleNextMinuteTick();
    }
    disableMinuteInterval() {
        if (this.minuteTimeout) {
            clearInterval(this.minuteTimeout);
        }
        this.minuteTimeout = undefined;
        this.minuteIntervalEnabled = false;
    }
    scheduleNextMinuteTick() {
        this.minuteTimeout = setTimeout(() => {
            this.tick();
        }, this.millisToNextMinute());
    }
    millisToNextMinute() {
        const now = new Date();
        return 60 * 1e3 - (now.getSeconds() * 1e3 + now.getMilliseconds());
    }
    tick() {
        if (this.minuteIntervalEnabled) {
            this.scheduleNextMinuteTick();
            this.tickHandler(this);
        } else if (this.secondIntervalEnabled) {
            this.scheduleNextSecondTick();
            this.tickHandler(this);
        }
    }
    isSecondIntervalEnabled() {
        return this.secondIntervalEnabled;
    }
    enableSecondInterval() {
        this.secondIntervalEnabled = true;
        if (this.secondTimeout) {
            return;
        }
        this.scheduleNextSecondTick();
    }
    disableSecondInterval() {
        if (this.secondTimeout) {
            clearInterval(this.secondTimeout);
        }
        this.secondTimeout = undefined;
        this.secondIntervalEnabled = false;
    }
    scheduleNextSecondTick() {
        this.secondTimeout = setTimeout(() => {
            this.tick();
        }, this.millisToNextSecond());
    }
    millisToNextSecond() {
        return 1e3 - new Date().getMilliseconds();
    }
    useSecondInterval() {
        if (!this.secondIntervalEnabled) {
            this.disableMinuteInterval();
            this.enableSecondInterval();
        }
    }
    useMinuteInterval() {
        if (!this.minuteIntervalEnabled) {
            this.disableSecondInterval();
            this.enableMinuteInterval();
        }
    }
    toggleBetweenSecondAndMinuteIntervals() {
        if (this.minuteIntervalEnabled) {
            this.useSecondInterval();
        } else {
            this.useMinuteInterval();
        }
    }
}

"use strict";

require("Font7x11Numeric7Seg").add(Graphics);

var alarmManager = new AlarmManager();

var clockInterval = new ClockInterval();

var eventsObj = new CalendarEvents([], alarmManager);

var clockFace = new ClockFace(clockInterval, eventsObj);

eventsObj.setClockFace(clockFace);

eventsObj.addEvent(new CalendarEvent(clockFace, "test1", "testdesc", new MyDate("2022-09-14", "5:00pm"), new MyDate("2022-09-14", "5:15pm")));

eventsObj.initAlarms();

eventsObj.selectUpcomingEvent();

new CalendarUpdater(clockFace, eventsObj).readCalendarDataAndUpdate();

Bangle.setUI("clock");

Bangle.loadWidgets();

clockFace.redrawAll();

clockInterval.setTickHandler(() => {
    clockFace.redrawAll();
});

clockInterval.useSecondInterval();

setupBangleEvents(clockFace, clockInterval, eventsObj);