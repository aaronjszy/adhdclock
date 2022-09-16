
enum TrackedEventBoundary {
    START,
    END,
}

class CalendarEvent {
    alarmHandler: ((clockFace: ClockFace, event: CalendarEvent) => void);
    id: string;
    clockFace: ClockFace;
    name: string;
    description: string;
    startTime: MyDate;
    endTime: MyDate;
    skipped: boolean;
    bangleCalendarEventId: number | undefined;
    trackedEventBoundary: TrackedEventBoundary;

    constructor(clockFace: ClockFace, name: string, description: string, startTime: MyDate, endTime: MyDate) {
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

    public setAlarmHandler(alarmHandler: (clockFace: ClockFace, event: CalendarEvent) => void) {
        this.alarmHandler = alarmHandler;
    }

    update(event: CalendarEvent): boolean {
        // This check is here just in case the provided event is not the same as this event. This should not happen.
        if(event.bangleCalendarEventId != this.bangleCalendarEventId) {
            return false;
        }

        // set equivalent event properties for fields we dont want included in the isModified check
        event.id = this.id;
        event.clockFace = this.clockFace;
        event.bangleCalendarEventId = this.bangleCalendarEventId;
        event.skipped = this.skipped;
        event.trackedEventBoundary = this.trackedEventBoundary;
        event.alarmHandler = this.alarmHandler;

        var isModified = JSON.stringify(event) != JSON.stringify(this);

        // Update the event properties from the provided matching event
        // Note that were not updating the event id
        this.name = event.name;
        this.description = event.description;
        this.startTime = event.startTime;
        this.endTime = event.endTime;

        return isModified;
    }

    setBangleCalendarEventId(bangleCalendarEventId: number) {
        this.bangleCalendarEventId = bangleCalendarEventId;
    }

    toggleSkip(): boolean {
        this.skipped = !this.skipped;
        return this.skipped
    }

    toggleTrackedEventBoundary() {
        this.trackedEventBoundary = (this.trackedEventBoundary == TrackedEventBoundary.END) ? TrackedEventBoundary.START : TrackedEventBoundary.END;
    }

    getTrackedEventBoundary(): TrackedEventBoundary {
        // if (this.startTime.date.getTime() == this.endTime.date.getTime()) {
        //     return TrackedEventBoundary.END;
        // }
        return this.trackedEventBoundary;
    }

    getTrackedEventDate(): MyDate {
        if(this.trackedEventBoundary == TrackedEventBoundary.START) {
            return this.startTime;
        }
        return this.endTime;
    }

    initAlarms(alarmManager: AlarmManager) {
        alarmManager.addAlarm(this.id+"/start", this.startTime.date, () => {
            if(!this.skipped && this.startTime.millisUntil() > 0) {
                this.alarmHandler(this.clockFace, this);
            }
        });
        alarmManager.addAlarm(this.id+"/end", this.endTime.date, () => {
            if(!this.skipped && this.endTime.millisUntil() > 0) {
                this.alarmHandler(this.clockFace, this);
            }
        });
    }

    displayName(): string {
        return this.name.substr(0, 14);
    }

    displayDescription(): string {
        if(this.description.length == 0) {
            return "empty";
        }
        if(this.displayDescription.length > 50) {
            return this.description.substr(0, 50) + "...";
        }

        return this.description;
    }

    displayTimeRemaining(): string {
        return this.getTrackedEventDate().timeRemainingAsString();
    }

    displaySecondsRemaining(): string {
        return this.getTrackedEventDate().secondsRemainingAsString();
    }

    durationMinutes(): number {
        var durationMillis = this.endTime.unixTimestampMillis() - this.startTime.unixTimestampMillis()
        return durationMillis / 1000 / 60;
    }
}

class CalendarEvents {
    clockFace: ClockFace;
    selectedEvent: number;
    events: CalendarEvent[];
    refocusTimeout: NodeJS.Timeout | undefined;
    alarmManager: AlarmManager;

    constructor(events: CalendarEvent[], alarmManager: AlarmManager) {
        // TODO this is gross, we dont use this but i need to add it to satisfy typescript
        this.clockFace = new ClockFace(new ClockInterval(), this);

        this.selectedEvent = 0;
        this.events = events;
        this.alarmManager = alarmManager;
        this.refocusTimeout = undefined;
    }

    public setClockFace(clockFace: ClockFace) {
        this.clockFace = clockFace;
    }

    public eventAlarmHandler(event: CalendarEvent) {
        this.selectEvent(event);
        this.clockFace.redrawAll();

        Bangle.setLCDPower(1);
        Bangle.buzz(1000).then(() => {
            return new Promise(resolve => setTimeout(resolve, 500));
        }).then(()=>{
            return Bangle.buzz(1000);
        }).then(() => {
            return new Promise(resolve => setTimeout(resolve, 500));
        }).then(()=>{
            return Bangle.buzz(1000);
        });
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
            if(calendarEvent.title == "" || calendarEvent.t != "calendar" || calendarEvent.allDay || calendarEvent.durationInSeconds == 86400 || calendarEvent.type != 0) {
                continue;
            }

            var newEvent = new CalendarEvent(this.clockFace, calendarEvent.title, calendarEvent.description, new MyDate(calStartEventTimeMillis), new MyDate(calEndEventTimeMillis));
            newEvent.setAlarmHandler(() => {this.eventAlarmHandler(newEvent)});
            newEvent.setBangleCalendarEventId(calendarEvent.id);
            if(this.addEvent(newEvent)) {
                updated++;
            }
        }
        this.sortEvents();
        this.dedupEvents();
        this.selectUpcomingEvent();
        this.initAlarms();

        return updated;
    }

    public addEvent(event: CalendarEvent): boolean {
        event.setAlarmHandler(()=>{this.eventAlarmHandler(event)});
        for(var i = 0; i < this.events.length; i++) {
            var e = this.events[i];
            if(e.bangleCalendarEventId == event.bangleCalendarEventId) {
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

    public dedupEvents() {
        for(var i = 0; i < this.events.length; i++) {
            var e = this.events[i];
            for(var j = i+1; j < this.events.length; j++) {
                var e2 = this.events[j];
                if(e.name == e2.name && e.startTime.date.getTime() == e2.startTime.date.getTime() && e.endTime.date.getTime() == e2.endTime.date.getTime()) {
                    this.events.splice(j, 1);
                    j--;
                }
            }
        }
    }

    public initAlarms() {
        for(var i = 0; i < this.events.length; i++) {
            var e = this.events[i];
            e.initAlarms(this.alarmManager);
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

    private getUpcomingEventIndex(): number {
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

        return soonestEventIndex;
    }

    public selectUpcomingEvent(): CalendarEvent {
        this.selectedEvent = this.getUpcomingEventIndex();
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
            this.clockFace.redrawAll();
        }, 5000);
    }

    public clearRefocusTimeout() {
        if(this.refocusTimeout) {
            clearTimeout(this.refocusTimeout);
        }
        this.refocusTimeout = undefined;
    }
}
