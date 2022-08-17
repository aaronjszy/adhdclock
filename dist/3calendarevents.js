var CalendarEvent = /** @class */ (function () {
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
    CalendarEvent.prototype.update = function (event) {
        event.id = this.id;
        event.alarm = this.alarm;
        event.skipped = this.skipped;
        var isModified = JSON.stringify(event) != JSON.stringify(this);
        this.name = event.name;
        this.startTime = event.startTime;
        this.endTime = event.endTime;
        return isModified;
    };
    CalendarEvent.prototype.setId = function (id) {
        this.id = id;
    };
    CalendarEvent.prototype.toggleSkip = function () {
        this.skipped = !this.skipped;
        this.initAlarm();
        return this.skipped;
    };
    CalendarEvent.prototype.initAlarm = function () {
        var _this = this;
        if (this.alarm) {
            clearTimeout(this.alarm);
        }
        this.alarm = undefined;
        if (!this.skipped && this.endTime.totalMillisToEvent() > 0) {
            this.alarm = setTimeout(function () { _this.alarmHandler(_this.clockFace, _this); }, this.endTime.totalMillisToEvent());
        }
    };
    CalendarEvent.prototype.displayName = function () {
        return this.name.substr(0, 14);
    };
    CalendarEvent.prototype.displayTimeRemaining = function () {
        return this.endTime.timeRemainingAsString();
    };
    return CalendarEvent;
}());
var Events = /** @class */ (function () {
    function Events(clockFace, events, alarmHandler) {
        this.clockFace = clockFace;
        this.selectedEvent = 0;
        this.events = events;
        this.refocusTimeout = undefined;
        this.alarmHandler = alarmHandler;
    }
    Events.prototype.updateFromCalendar = function (calendar) {
        var updated = 0;
        var now = new Date();
        var maxEventTimeOffset = 1000 * 60 * 60 * 24;
        for (var i = 0; i < calendar.length; i++) {
            var calendarEvent = calendar[i];
            var calStartEventTimeMillis = calendarEvent.timestamp * 1000;
            var calEndEventTimeMillis = (calendarEvent.timestamp + calendarEvent.durationInSeconds) * 1000;
            if (calEndEventTimeMillis > (now.getTime() + maxEventTimeOffset) || calEndEventTimeMillis < (now.getTime() - maxEventTimeOffset)) {
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
    Events.prototype.addEvent = function (event) {
        for (var i = 0; i < this.events.length; i++) {
            var e = this.events[i];
            if (e.id == event.id) {
                return e.update(event);
            }
        }
        this.events.push(event);
        return true;
    };
    Events.prototype.sortEvents = function () {
        this.events = this.events.sort(function (e1, e2) {
            return e1.endTime.unixTimestampMillis() - e2.endTime.unixTimestampMillis();
        });
    };
    Events.prototype.initAlarms = function () {
        for (var i = 0; i < this.events.length; i++) {
            var e = this.events[i];
            e.initAlarm();
        }
    };
    Events.prototype.selectEvent = function (event) {
        for (var i = 0; i < this.events.length; i++) {
            var e = this.events[i];
            if (e == event) {
                this.selectedEvent = i;
                return this.getSelectedEvent();
            }
        }
        return this.getSelectedEvent();
    };
    Events.prototype.selectUpcomingEvent = function () {
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
    Events.prototype.selectNextEvent = function () {
        if (this.selectedEvent < this.events.length - 1) {
            this.selectedEvent++;
        }
        this.setRefocusTimeout();
        return this.getSelectedEvent();
    };
    Events.prototype.selectPreviousEvent = function () {
        if (this.selectedEvent > 0) {
            this.selectedEvent--;
        }
        this.setRefocusTimeout();
        return this.getSelectedEvent();
    };
    Events.prototype.getSelectedEvent = function () {
        return this.events[this.selectedEvent];
    };
    Events.prototype.setRefocusTimeout = function () {
        var _this = this;
        this.clearRefocusTimeout();
        this.refocusTimeout = setTimeout(function () {
            var e = _this.selectUpcomingEvent();
            _this.clearRefocusTimeout();
            _this.clockFace.redrawAll(_this);
        }, 5000);
    };
    Events.prototype.clearRefocusTimeout = function () {
        if (this.refocusTimeout) {
            clearTimeout(this.refocusTimeout);
        }
        this.refocusTimeout = undefined;
    };
    return Events;
}());
