
enum TrackedEventBoundary {
    START,
    END,
}

class CalendarEvent {
    alarmHandler: (clockFace: ClockFace, event: CalendarEvent) => void;
    clockFace: ClockFace;
    name: string;
    startTime: MyDate;
    endTime: MyDate;
    skipped: boolean;
    startAlarm: NodeJS.Timeout | undefined;
    endAlarm: NodeJS.Timeout | undefined;
    id: number | undefined;
    trackedEventBoundary: TrackedEventBoundary;

    constructor(clockFace: ClockFace, alarmHandler: (clockFace: ClockFace, event: CalendarEvent) => void, name: string, startTime: MyDate, endTime: MyDate) {
        this.alarmHandler = alarmHandler;
        this.clockFace = clockFace;
        this.name = name;
        this.startTime = startTime;
        this.endTime = endTime;
        this.skipped = false;
        this.startAlarm = undefined;
        this.endAlarm = undefined;
        this.id = undefined;
        this.trackedEventBoundary = TrackedEventBoundary.END;
    }

    update(event: CalendarEvent) {
        event.id = this.id;
        event.startAlarm = this.startAlarm;
        event.endAlarm = this.endAlarm;
        event.skipped = this.skipped;
        event.trackedEventBoundary = this.trackedEventBoundary;
        var isModified = JSON.stringify(event) != JSON.stringify(this);

        this.name = event.name;
        this.startTime = event.startTime;
        this.endTime = event.endTime;

        return isModified;
    }

    setId(id: number) {
        this.id = id;
    }

    toggleSkip(): boolean {
        this.skipped = !this.skipped;
        this.initAlarms();
        return this.skipped
    }

    toggleTrackedEventBoundary() {
        this.trackedEventBoundary = (this.trackedEventBoundary == TrackedEventBoundary.END) ? TrackedEventBoundary.START : TrackedEventBoundary.END;
    }

    getTrackedEventBoundary(): TrackedEventBoundary {
        return this.trackedEventBoundary;
    }

    getTrackedEventDate(): MyDate {
        if(this.trackedEventBoundary == TrackedEventBoundary.START) {
            return this.startTime;
        }
        return this.endTime;
    }

    initAlarms() {
        if(this.startAlarm) {
            clearTimeout(this.startAlarm);
        }
        this.startAlarm = undefined;
        if(!this.skipped && this.startTime.millisUntil() > 0) {
            this.startAlarm = setTimeout(() => {this.alarmHandler(this.clockFace, this)}, this.startTime.millisUntil());
        }

        if(this.endAlarm) {
            clearTimeout(this.endAlarm);
        }
        this.endAlarm = undefined;
        if(!this.skipped && this.endTime.millisUntil() > 0) {
            this.endAlarm = setTimeout(() => {this.alarmHandler(this.clockFace, this)}, this.endTime.millisUntil());
        }
    }

    displayName(): string {
        return this.name.substr(0, 14);
    }

    displayTimeRemaining(): string {
        return this.getTrackedEventDate().timeRemainingAsString();
    }

    durationMinutes(): number {
        var durationMillis = this.endTime.unixTimestampMillis() - this.startTime.unixTimestampMillis()
        return durationMillis / 1000 / 60;
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
            e.initAlarms();
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
