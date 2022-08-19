"use strict";

function zeroPad(n) {
    return ("0" + n).substr(-2);
}

"use strict";

class MyDate {
    constructor(dateStr) {
        this.date = dateStr ? new Date(dateStr) : new Date();
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
    totalMillisToEvent() {
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
    equals(other) {
        return this.date.getTime() == other.date.getTime();
    }
}

"use strict";

class CalendarEvent {
    constructor(clockFace, alarmHandler, name, startTime, endTime) {
        this.alarmHandler = alarmHandler;
        this.clockFace = clockFace;
        this.name = name;
        this.startTime = startTime;
        this.endTime = endTime;
        this.skipped = false;
        this.alarm = undefined;
        this.id = undefined;
    }
    update(event) {
        event.id = this.id;
        event.alarm = this.alarm;
        event.skipped = this.skipped;
        var isModified = JSON.stringify(event) != JSON.stringify(this);
        this.name = event.name;
        this.startTime = event.startTime;
        this.endTime = event.endTime;
        return isModified;
    }
    setId(id) {
        this.id = id;
    }
    toggleSkip() {
        this.skipped = !this.skipped;
        this.initAlarm();
        return this.skipped;
    }
    initAlarm() {
        if (this.alarm) {
            clearTimeout(this.alarm);
        }
        this.alarm = undefined;
        if (!this.skipped && this.endTime.totalMillisToEvent() > 0) {
            this.alarm = setTimeout(() => {
                this.alarmHandler(this.clockFace, this);
            }, this.endTime.totalMillisToEvent());
        }
    }
    displayName() {
        return this.name.substr(0, 14);
    }
    displayTimeRemaining() {
        return this.endTime.timeRemainingAsString();
    }
}

class Events {
    constructor(clockFace, events, alarmHandler) {
        this.clockFace = clockFace;
        this.selectedEvent = 0;
        this.events = events;
        this.refocusTimeout = undefined;
        this.alarmHandler = alarmHandler;
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
            if (calendarEvent.title == "" || calendarEvent.t != "calendar" || calendarEvent.allDay || calendarEvent.type != 0) {
                continue;
            }
            var newEvent = new CalendarEvent(this.clockFace, this.alarmHandler, calendarEvent.title, new MyDate(calStartEventTimeMillis), new MyDate(calEndEventTimeMillis));
            newEvent.setId(calendarEvent.id);
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
        for (var i = 0; i < this.events.length; i++) {
            var e = this.events[i];
            if (e.id == event.id) {
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
            e.initAlarm();
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
    selectUpcomingEvent() {
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
        this.selectedEvent = soonestEventIndex;
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
            this.clockFace.redrawAll(this);
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
        console.log("1", this.events);
    }
    forceCalendarUpdate() {
        console.log("2", this.events);
        var cal = require("Storage").readJSON("android.calendar.json", true) || [];
        if (NRF.getSecurityStatus().connected) {
            E.showPrompt("Do you want to also clear the internal database first?", {
                buttons: {
                    Yes: 1,
                    No: 2,
                    Cancel: 3
                }
            }).then(v => {
                console.log("3", this.events);
                switch (v) {
                  case 1:
                    require("Storage").writeJSON("android.calendar.json", []);
                    cal = [];

                  case 2:
                    console.log("4", this.events);
                    this.gbSend(JSON.stringify({
                        t: "force_calendar_sync",
                        ids: cal.map(e => e.id)
                    }));
                    E.showAlert("Request sent to the phone").then(() => {
                        this.readCalendarDataAndUpdate();
                    });
                    break;

                  case 3:
                  default:
                    this.clockFace.redrawAll(this.events);
                    return;
                }
            });
        } else {
            E.showAlert("You are not connected").then(() => {
                this.clockFace.redrawAll(this.events);
            });
        }
    }
    gbSend(message) {
        Bluetooth.println("");
        Bluetooth.println(JSON.stringify(message));
    }
    readCalendarDataAndUpdate() {
        console.log("5", this.events);
        var calendarJSON = require("Storage").readJSON("android.calendar.json", true);
        if (!calendarJSON) {
            E.showAlert("No calendar data found.").then(() => {
                E.showAlert().then(() => {
                    console.log("6", this.events);
                    this.clockFace.redrawAll(this.events);
                });
            });
            return;
        } else {
            var updateCount = this.events.updateFromCalendar(calendarJSON);
            E.showAlert("Got calendar data. Updated " + updateCount + ".").then(() => {
                E.showAlert().then(() => {
                    console.log("7", this.events);
                    this.clockFace.redrawAll(this.events);
                });
            });
        }
    }
}

"use strict";

class ClockFace {
    redrawAll(eventsObj) {
        g.clear();
        Bangle.drawWidgets();
        this.draw(eventsObj);
    }
    draw(eventsObj) {
        var now = new MyDate();
        var e = eventsObj.getSelectedEvent();
        if (!e) {
            E.showMessage("No events.");
            return;
        }
        var X = 176 * .5;
        var Y = 176 * .75;
        g.reset();
        new Meter(e).draw();
        g.setFontAlign(0, 1);
        g.setFont("Vector", 20);
        g.drawString(e.displayName(), X, Y - 60, true);
        g.setFont("Vector", 40);
        g.drawString(e.displayTimeRemaining(), X, Y, true);
        var leftTime = "";
        var midTime = "";
        if (e.startTime.formattedTime() == e.endTime.formattedTime()) {
            midTime = now.formattedTime();
        } else if (e.startTime < now) {
            leftTime = e.startTime.formattedTime();
            midTime = now.formattedTime();
        } else {
            leftTime = e.startTime.formattedTime();
        }
        var rightTime = e.endTime.formattedTime();
        require("Font5x7Numeric7Seg").add(Graphics);
        g.setFont("5x7Numeric7Seg", 2);
        g.setFontAlign(-1, 1);
        g.drawString(leftTime, 5, g.getHeight() - 2, true);
        g.setFontAlign(1, 1);
        g.drawString(rightTime, g.getWidth() - 5, g.getHeight() - 2, true);
        if (e.skipped) {
            g.drawLine(0, 0, g.getWidth(), g.getHeight());
            g.drawLine(1, 0, g.getWidth() + 1, g.getHeight());
            g.drawLine(2, 0, g.getWidth() + 2, g.getHeight());
            g.drawLine(g.getWidth(), 0, 0, g.getHeight());
            g.drawLine(g.getWidth() - 1, 0, 0, g.getHeight() - 1);
            g.drawLine(g.getWidth() - 2, 0, 0, g.getHeight() - 2);
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
        this.meterStartTime = new Date(event.endTime.date.getTime() + -this.maxMinutesInMeter * 6e4);
        this.meterEndTime = event.endTime.date;
        this.padding = 5;
        this.height = 22;
        this.meterTopOffsetPos = g.getHeight() * .77;
        this.maxMeterWidth = g.getWidth() - this.padding * 2;
    }
    segmentCount(event) {
        var segmentCount = Math.ceil(event.endTime.minutesUntil() / this.minutesPerSegment);
        if (segmentCount <= 1) {
            segmentCount = 1;
        }
        if (segmentCount > this.maxSegmentCount) {
            segmentCount = this.maxSegmentCount;
        }
        return segmentCount;
    }
    draw() {
        var originalColor = g.getColor();
        g.setColor("#00FF00");
        this.drawMeterFill(this.meterStartTime, this.meterEndTime);
        g.setColor("#2c007d");
        this.drawMeterFill(this.eventStart, this.eventEnd);
        g.setColor("#FF0000");
        this.drawMeterFill(this.meterStartTime, new Date());
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
            g.drawLine(x, this.meterTopOffsetPos, x, this.meterTopOffsetPos + this.height);
            g.drawLine(x - 1, this.meterTopOffsetPos, x - 1, this.meterTopOffsetPos + this.height);
        }
        g.setColor(originalColor);
    }
    drawMeterFill(startDate, endDate) {
        var startXPos = this.dateToXPos(startDate);
        var endXPos = this.dateToXPos(endDate);
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

function setupBangleEvents(clockFace, minuteInterval, eventsObj) {
    Bangle.on("swipe", function(directionLR, directionUD) {
        if (directionLR == -1 && directionUD == 0) {
            eventsObj.selectNextEvent();
            clockFace.redrawAll(eventsObj);
        }
        if (directionLR == 1 && directionUD == 0) {
            eventsObj.selectPreviousEvent();
            clockFace.redrawAll(eventsObj);
        }
        if (directionUD == -1 && directionLR == 0) {
            var e = eventsObj.getSelectedEvent();
            var skipped = e.toggleSkip();
            clockFace.redrawAll(eventsObj);
            if (skipped) {
                setTimeout(() => {
                    eventsObj.selectUpcomingEvent();
                    clockFace.redrawAll(eventsObj);
                }, 200);
            }
        }
        if (directionUD == 1 && directionLR == 0) {
            new CalendarUpdater(clockFace, eventsObj).forceCalendarUpdate();
        }
    });
    Bangle.on("lcdPower", on => {
        if (minuteInterval) {
            clearInterval(minuteInterval);
        }
        if (on) {
            minuteInterval = setInterval(() => {
                clockFace.draw(eventsObj);
            }, 60 * 1e3);
            clockFace.draw(eventsObj);
        }
    });
}

"use strict";

require("Font7x11Numeric7Seg").add(Graphics);

var clockFace = new ClockFace();

function eventAlarmHandler(clockFace, event) {
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

var eventsObj = new Events(clockFace, [], eventAlarmHandler);

eventsObj.initAlarms();

eventsObj.selectUpcomingEvent();

new CalendarUpdater(clockFace, eventsObj).readCalendarDataAndUpdate();

Bangle.setUI("clock");

Bangle.loadWidgets();

clockFace.redrawAll(eventsObj);

var minuteInterval = setInterval(() => {
    clockFace.redrawAll(eventsObj);
}, 60 * 1e3);

setupBangleEvents(clockFace, minuteInterval, eventsObj);