
class CalendarEvent {
    alarmHandler: (clockFace: ClockFace, event: CalendarEvent) => void;
    clockFace: ClockFace;
    name: string;
    startTime: MyDate;
    endTime: MyDate;
    skipped: boolean;
    alarm: NodeJS.Timeout | undefined;
    id: number | undefined;

    constructor(clockFace: ClockFace, alarmHandler: (clockFace: ClockFace, event: CalendarEvent) => void, name: string, startTime: MyDate, endTime: MyDate) {
        this.alarmHandler = alarmHandler;
        this.clockFace = clockFace;
        this.name = name;
        this.startTime = startTime;
        this.endTime = endTime;
        this.skipped = false;
        this.alarm = undefined;
        this.id = undefined;
    }

    update(event: CalendarEvent) {
        event.id = this.id;
        event.alarm = this.alarm;
        event.skipped = this.skipped;
        var isModified = JSON.stringify(event) != JSON.stringify(this);

        this.name = event.name;
        this.startTime = event.startTime;
        this.endTime = event.endTime;

        return isModified;
    }

    setId(id: number) {
        this.id = id;
    }

    toggleSkip() {
        this.skipped = !this.skipped;
        this.initAlarm();
        return this.skipped
    }

    initAlarm() {
        if(this.alarm) {
            clearTimeout(this.alarm);
        }
        this.alarm = undefined;
        if(!this.skipped && this.endTime.totalMillisToEvent() > 0) {
            this.alarm = setTimeout(() => {this.alarmHandler(this.clockFace, this)}, this.endTime.totalMillisToEvent());
        }
    }

    displayName() {
        return this.name.substr(0, 14);
    }

    displayTimeRemaining() {
        return this.endTime.timeRemainingAsString()
    }
}

class Events {
    clockFace: ClockFace;
    selectedEvent: number;
    events: CalendarEvent[];
    refocusTimeout: NodeJS.Timeout | undefined;
    alarmHandler: (clockFace: ClockFace, event: CalendarEvent) => void;

    constructor(clockFace: ClockFace, events: CalendarEvent[], alarmHandler: (clockFace: ClockFace, event: CalendarEvent) => void) {
        this.clockFace = clockFace;
        this.selectedEvent = 0;
        this.events = events;
        this.refocusTimeout = undefined;
        this.alarmHandler = alarmHandler;
    }

    public updateFromCalendar(calendar: any) {
        var updated = 0;
        var now = new Date();
        var maxEventTimeOffset = 1000*60*60*24;
        for(var i = 0; i < calendar.length; i++) {
            var calendarEvent = calendar[i];
            var calStartEventTimeMillis = calendarEvent.timestamp*1000;
            var calEndEventTimeMillis = (calendarEvent.timestamp+calendarEvent.durationInSeconds)*1000;

            if (calEndEventTimeMillis > (now.getTime()+maxEventTimeOffset) || calEndEventTimeMillis < (now.getTime()-maxEventTimeOffset)) {
                continue;
            }
            if(calendarEvent.title == "" || calendarEvent.t != "calendar" || calendarEvent.allDay || calendarEvent.type != 0) {
                continue;
            }

            var newEvent = new CalendarEvent(this.clockFace, this.alarmHandler, calendarEvent.title, new MyDate(calStartEventTimeMillis), new MyDate(calEndEventTimeMillis));
            newEvent.setId(calendarEvent.id);
            if(this.addEvent(newEvent)) {
                updated++;
            }
        }
        this.sortEvents();
        this.selectUpcomingEvent();
        this.initAlarms();

        return updated;
    }

    public addEvent(event: CalendarEvent): boolean {
        for(var i = 0; i < this.events.length; i++) {
            var e = this.events[i];
            if(e.id == event.id) {
                return e.update(event);
            }
        }
        this.events.push(event);
        return true;
    }

    public sortEvents() {
        this.events = this.events.sort((e1, e2) => {
            return e1.endTime.unixTimestampMillis() - e2.endTime.unixTimestampMillis();
        });
    }

    public initAlarms() {
        for(var i = 0; i < this.events.length; i++) {
            var e = this.events[i];
            e.initAlarm();
        }
    }

    public selectEvent(event: CalendarEvent) {
        for(var i = 0; i < this.events.length; i++) {
            var e = this.events[i];
            if(e == event) {
                this.selectedEvent = i;
                return this.getSelectedEvent();
            }
        }
        return this.getSelectedEvent();
    }

    public selectUpcomingEvent() {
        var soonestEventSeconds = Number.MAX_VALUE;
        var soonestEventIndex = this.events.length-1;
        for(var i = 0; i < this.events.length; i++) {
            var e = this.events[i];
            var nextEventSeconds = e.endTime.secondsUntil();
            if(!e.skipped && nextEventSeconds >= 0 && nextEventSeconds < soonestEventSeconds) {
                soonestEventSeconds = e.endTime.secondsUntil();
                soonestEventIndex = i
            }
        }
        
        this.selectedEvent = soonestEventIndex;
        return this.getSelectedEvent();
    }

    public selectNextEvent() {
        if(this.selectedEvent < this.events.length-1) {
            this.selectedEvent++;
        }
        this.setRefocusTimeout();
        return this.getSelectedEvent();
    }

    public selectPreviousEvent() {
        if(this.selectedEvent > 0) {
            this.selectedEvent--;
        }
        this.setRefocusTimeout();
        return this.getSelectedEvent();
    }

    public getSelectedEvent() {
        return this.events[this.selectedEvent];
    }

    public setRefocusTimeout() {
        this.clearRefocusTimeout();
        this.refocusTimeout = setTimeout(()=>{
            var e = this.selectUpcomingEvent();
            this.clearRefocusTimeout();
            this.clockFace.redrawAll(this);
        }, 5000);
    }

    public clearRefocusTimeout() {
        if(this.refocusTimeout) {
            clearTimeout(this.refocusTimeout);
        }
        this.refocusTimeout = undefined;
    }
}
