function zeroPad(n) {
    return ("0" + n).substr(-2);
}

var MyDate = function() {
    function MyDate(dateStr) {
        this.date = dateStr ? new Date(dateStr) : new Date();
    }
    MyDate.prototype.valueOf = function() {
        return this.date;
    };
    MyDate.prototype.formattedTime = function() {
        var hours12 = this.date.getHours() % 12;
        hours12 = hours12 == 0 ? 12 : hours12;
        var paddedMinute = zeroPad(this.date.getMinutes());
        return "".concat(hours12, ":").concat(paddedMinute);
    };
    MyDate.prototype.formattedDate = function() {
        var month = require("locale").month(this.date, 1);
        var dayOfMonth = this.date.getDate();
        return "".concat(month, " ").concat(dayOfMonth);
    };
    MyDate.prototype.formattedDateTime = function() {
        return "".concat(this.formattedDate(), " ").concat(this.formattedTime());
    };
    MyDate.prototype.unixTimestampMillis = function() {
        return this.date.getTime();
    };
    MyDate.prototype.totalMillisToEvent = function() {
        var now = new Date();
        return this.date.getTime() - now.getTime();
    };
    MyDate.prototype.totalSecondsToEvent = function() {
        var now = new Date();
        return (this.date.getTime() - now.getTime()) / 1e3 + 1;
    };
    MyDate.prototype.minutesUntil = function() {
        var now = new Date();
        return (this.date.getTime() - now.getTime()) / 1e3 / 60 + 1;
    };
    MyDate.prototype.timeRemainingAsString = function() {
        var totalSecondsToEvent = this.totalSecondsToEvent();
        var sign = totalSecondsToEvent < 0 ? "-" : "";
        var totalSecondsToEventAbs = Math.abs(totalSecondsToEvent);
        var totalMinutesToEventAbs = Math.floor(totalSecondsToEventAbs / 60);
        var hoursToEventAbs = Math.floor(totalMinutesToEventAbs / 60);
        var minutesToEventAbs = totalMinutesToEventAbs % 60;
        if (hoursToEventAbs == 0) {
            return "".concat(sign).concat(minutesToEventAbs);
        } else {
            return "".concat(sign).concat(hoursToEventAbs, ":").concat(zeroPad(minutesToEventAbs));
        }
    };
    MyDate.prototype.equals = function(other) {
        return this.date.getTime() == other.date.getTime();
    };
    return MyDate;
}();

var CalendarEvent = function() {
    function CalendarEvent(clockFace, alarmHandler, name, startTime, endTime) {
        this.alarmHandler = alarmHandler;
        this.clockFace = clockFace;
        this.name = name;
        this.startTime = startTime;
        this.endTime = endTime;
        this.skipped = false;
        this.alarm = undefined;
        this.id = undefined;
    }
    CalendarEvent.prototype.update = function(event) {
        event.id = this.id;
        event.alarm = this.alarm;
        event.skipped = this.skipped;
        var isModified = JSON.stringify(event) != JSON.stringify(this);
        this.name = event.name;
        this.startTime = event.startTime;
        this.endTime = event.endTime;
        return isModified;
    };
    CalendarEvent.prototype.setId = function(id) {
        this.id = id;
    };
    CalendarEvent.prototype.toggleSkip = function() {
        this.skipped = !this.skipped;
        this.initAlarm();
        return this.skipped;
    };
    CalendarEvent.prototype.initAlarm = function() {
        var _this = this;
        if (this.alarm) {
            clearTimeout(this.alarm);
        }
        this.alarm = undefined;
        if (!this.skipped && this.endTime.totalMillisToEvent() > 0) {
            this.alarm = setTimeout(function() {
                _this.alarmHandler(_this.clockFace, _this);
            }, this.endTime.totalMillisToEvent());
        }
    };
    CalendarEvent.prototype.displayName = function() {
        return this.name.substr(0, 14);
    };
    CalendarEvent.prototype.displayTimeRemaining = function() {
        return this.endTime.timeRemainingAsString();
    };
    return CalendarEvent;
}();

var Events = function() {
    function Events(clockFace, events, alarmHandler) {
        this.clockFace = clockFace;
        this.selectedEvent = 0;
        this.events = events;
        this.refocusTimeout = undefined;
        this.alarmHandler = alarmHandler;
    }
    Events.prototype.updateFromCalendar = function(calendar) {
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
    };
    Events.prototype.addEvent = function(event) {
        for (var i = 0; i < this.events.length; i++) {
            var e = this.events[i];
            if (e.id == event.id) {
                return e.update(event);
            }
        }
        this.events.push(event);
        return true;
    };
    Events.prototype.sortEvents = function() {
        this.events = this.events.sort(function(e1, e2) {
            return e1.endTime.unixTimestampMillis() - e2.endTime.unixTimestampMillis();
        });
    };
    Events.prototype.initAlarms = function() {
        for (var i = 0; i < this.events.length; i++) {
            var e = this.events[i];
            e.initAlarm();
        }
    };
    Events.prototype.selectEvent = function(event) {
        for (var i = 0; i < this.events.length; i++) {
            var e = this.events[i];
            if (e == event) {
                this.selectedEvent = i;
                return this.getSelectedEvent();
            }
        }
        return this.getSelectedEvent();
    };
    Events.prototype.selectUpcomingEvent = function() {
        var soonestEventSeconds = Number.MAX_VALUE;
        var soonestEventIndex = this.events.length - 1;
        for (var i = 0; i < this.events.length; i++) {
            var e = this.events[i];
            var nextEventSeconds = e.endTime.totalSecondsToEvent();
            if (!e.skipped && nextEventSeconds >= 0 && nextEventSeconds < soonestEventSeconds) {
                soonestEventSeconds = e.endTime.totalSecondsToEvent();
                soonestEventIndex = i;
            }
        }
        this.selectedEvent = soonestEventIndex;
        return this.getSelectedEvent();
    };
    Events.prototype.selectNextEvent = function() {
        if (this.selectedEvent < this.events.length - 1) {
            this.selectedEvent++;
        }
        this.setRefocusTimeout();
        return this.getSelectedEvent();
    };
    Events.prototype.selectPreviousEvent = function() {
        if (this.selectedEvent > 0) {
            this.selectedEvent--;
        }
        this.setRefocusTimeout();
        return this.getSelectedEvent();
    };
    Events.prototype.getSelectedEvent = function() {
        return this.events[this.selectedEvent];
    };
    Events.prototype.setRefocusTimeout = function() {
        var _this = this;
        this.clearRefocusTimeout();
        this.refocusTimeout = setTimeout(function() {
            var e = _this.selectUpcomingEvent();
            _this.clearRefocusTimeout();
            _this.clockFace.redrawAll(_this);
        }, 5e3);
    };
    Events.prototype.clearRefocusTimeout = function() {
        if (this.refocusTimeout) {
            clearTimeout(this.refocusTimeout);
        }
        this.refocusTimeout = undefined;
    };
    return Events;
}();

var CalendarUpdater = function() {
    function CalendarUpdater(clockFace, events) {
        this.clockFace = clockFace;
        this.events = events;
    }
    CalendarUpdater.prototype.forceCalendarUpdate = function() {
        var _this = this;
        var cal = require("Storage").readJSON("android.calendar.json", true) || [];
        if (NRF.getSecurityStatus().connected) {
            E.showPrompt("Do you want to also clear the internal database first?", {
                buttons: {
                    Yes: 1,
                    No: 2,
                    Cancel: 3
                }
            }).then(function(v) {
                switch (v) {
                  case 1:
                    require("Storage").writeJSON("android.calendar.json", []);
                    cal = [];

                  case 2:
                    _this.gbSend({
                        t: "force_calendar_sync",
                        ids: cal.map(function(e) {
                            return e.id;
                        })
                    });
                    E.showAlert("Request sent to the phone").then(_this.readCalendarDataAndUpdate);
                    break;

                  case 3:
                  default:
                    _this.clockFace.redrawAll(_this.events);
                    return;
                }
            });
        } else {
            E.showAlert("You are not connected").then(this.clockFace.redrawAll);
        }
    };
    CalendarUpdater.prototype.gbSend = function(message) {
        Bluetooth.println("");
        Bluetooth.println(JSON.stringify(message));
    };
    CalendarUpdater.prototype.readCalendarDataAndUpdate = function() {
        var calendarJSON = require("Storage").readJSON("android.calendar.json", true);
        if (!calendarJSON) {
            E.showAlert("No calendar data found.").then(function() {
                E.showAlert().then(function() {
                    this.clockFace.redrawAll(this.events);
                });
            });
            return;
        } else {
            var updateCount = this.events.updateFromCalendar(calendarJSON);
            E.showAlert("Got calendar data. Updated " + updateCount + ".").then(function() {
                E.showAlert().then(function() {
                    this.clockFace.redrawAll(this.events);
                });
            });
        }
    };
    return CalendarUpdater;
}();

var ClockFace = function() {
    function ClockFace() {}
    ClockFace.prototype.redrawAll = function(eventsObj) {
        g.clear();
        Bangle.drawWidgets();
        this.draw(eventsObj);
    };
    ClockFace.prototype.draw = function(eventsObj) {
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
        g.setFontAlign(0, 1);
        g.drawString(midTime, g.getWidth() / 2, g.getHeight() - 2, true);
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
    };
    return ClockFace;
}();

var Meter = function() {
    function Meter(event) {
        this.minutesPerSegment = 30;
        this.maxSegmentCount = 10;
        this.eventStart = event.startTime.date;
        this.eventEnd = event.endTime.date;
        this.segmentCountInt = this.segmentCount(event);
        this.maxMinutesInMeter = this.segmentCountInt * this.minutesPerSegment;
        this.meterStartTime = new Date(event.endTime.date + -this.maxMinutesInMeter * 6e4);
        this.meterEndTime = event.endTime.date;
        this.padding = 5;
        this.height = 22;
        this.meterTopOffsetPos = g.getHeight() * .77;
        this.maxMeterWidth = g.getWidth() - this.padding * 2;
    }
    Meter.prototype.segmentCount = function(event) {
        var segmentCount = Math.ceil(event.endTime.minutesUntil() / this.minutesPerSegment);
        if (segmentCount == 0) {
            segmentCount = 1;
        }
        if (segmentCount > this.maxSegmentCount) {
            segmentCount = this.maxSegmentCount;
        }
        return segmentCount;
    };
    Meter.prototype.draw = function() {
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
    };
    Meter.prototype.drawMeterFill = function(startDate, endDate) {
        var startXPos = this.dateToXPos(startDate);
        var endXPos = this.dateToXPos(endDate);
        g.fillRect(startXPos, this.meterTopOffsetPos, endXPos, this.meterTopOffsetPos + this.height);
    };
    Meter.prototype.dateToXPos = function(date) {
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
    };
    return Meter;
}();

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
                setTimeout(function() {
                    eventsObj.selectUpcomingEvent();
                    clockFace.redrawAll(eventsObj);
                }, 200);
            }
        }
        if (directionUD == 1 && directionLR == 0) {
            new CalendarUpdater(clockFace, eventsObj).forceCalendarUpdate();
        }
    });
    Bangle.on("lcdPower", function(on) {
        if (minuteInterval) clearInterval(minuteInterval);
        minuteInterval = undefined;
        if (on) {
            minuteInterval = setInterval(function() {
                clockFace.draw(eventsObj);
            }, 60 * 1e3);
            clockFace.draw(eventsObj);
        }
    });
}

require("Font7x11Numeric7Seg").add(Graphics);

var clockFace = new ClockFace();

function eventAlarmHandler(clockFace, event) {
    Bangle.setLCDPower(1);
    Bangle.buzz(1e3).then(function() {
        return new Promise(function(resolve) {
            return setTimeout(resolve, 500);
        });
    }).then(function() {
        return Bangle.buzz(1e3);
    }).then(function() {
        return new Promise(function(resolve) {
            return setTimeout(resolve, 500);
        });
    }).then(function() {
        return Bangle.buzz(1e3);
    });
}

var eventsObj = new Events(clockFace, [], eventAlarmHandler);

eventsObj.sortEvents();

eventsObj.initAlarms();

eventsObj.selectUpcomingEvent();

new CalendarUpdater(clockFace, eventsObj).readCalendarDataAndUpdate();

Bangle.setUI("clock");

Bangle.loadWidgets();

clockFace.redrawAll(eventsObj);

var minuteInterval = setInterval(function() {
    clockFace.redrawAll(eventsObj);
}, 60 * 1e3);

setupBangleEvents(clockFace, minuteInterval, eventsObj);