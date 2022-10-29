
enum TrackedEventBoundary {
    START,
    END,
}

class CalendarEvent {
    alarmHandler: ((event: CalendarEvent) => void);
    id: string;
    name: string;
    description: string;
    startTime: MyDate;
    endTime: MyDate;
    skipped: boolean;
    bangleCalendarEventId: number | undefined;
    trackedEventBoundary: TrackedEventBoundary;

    constructor(name: string, description: string, startTime: MyDate, endTime: MyDate) {
        this.alarmHandler = () => {};
        this.id = `${name}/${new Date().getTime().toString()}`;
        this.name = name;
        this.description = description;
        this.startTime = startTime;
        this.endTime = endTime;
        this.skipped = false;
        this.bangleCalendarEventId = undefined;
        this.trackedEventBoundary = TrackedEventBoundary.END;
    }

    public static fromJSON(json: any): CalendarEvent {
        var e = new CalendarEvent(json.name, json.description, new MyDate(json.startTime.date), new MyDate(json.endTime.date))
        e.id = json.id
        e.skipped = json.skipped
        e.bangleCalendarEventId = json.bangleCalendarEventId
        e.trackedEventBoundary = json.trackedEventBoundary
        return e
    }

    public setAlarmHandler(alarmHandler: (event: CalendarEvent) => void) {
        this.alarmHandler = alarmHandler;
    }

    update(event: CalendarEvent): boolean {
        // This check is here just in case the provided event is not the same as this event. This should not happen.
        if(event.bangleCalendarEventId != this.bangleCalendarEventId) {
            return false;
        }

        // set equivalent event properties for fields we dont want included in the isModified check
        event.id = this.id;
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

    isExpired(): boolean{
        return false;
    }
}

class CalendarEvents {
    selectedEvent: number;
    events: CalendarEvent[];
    refocusTimeout: NodeJS.Timeout | undefined;

    constructor(events: CalendarEvent[]) {
        this.selectedEvent = 0;
        this.events = events;
        this.refocusTimeout = undefined;
    }

    public save() {
        var file = require("Storage").open("adhdclock.events","w");
        file.write(JSON.stringify(this));
    }

    public restore(): CalendarEvents {
        var file = require("Storage").open("adhdclock.events","r");
        if(file) {
            var data = file.read(file.getLength());
            if(data) {
                var restoredObject = JSON.parse(data);
                this.selectedEvent = restoredObject.selectedEvent;
                this.events = []
                for(var i = 0; i < restoredObject.events.length; i++) {
                    this.events[i] = CalendarEvent.fromJSON(restoredObject.events[i]);
                }
            }
        }
        return this
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
            if(!calendarEvent.title || calendarEvent.title == "" || calendarEvent.t != "calendar" || calendarEvent.allDay || calendarEvent.durationInSeconds == 86400 || calendarEvent.type != 0) {
                continue;
            }

            var newEvent = new CalendarEvent(calendarEvent.title, calendarEvent.description, new MyDate(calStartEventTimeMillis), new MyDate(calEndEventTimeMillis));
            newEvent.setBangleCalendarEventId(calendarEvent.id);
            if(this.addEvent(newEvent)) {
                updated++;
            }
        }
        this.dedupEvents();
        this.sortEvents();
        this.selectUpcomingEvent();

        return updated;
    }

    public addEvent(event: CalendarEvent): boolean {
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

    // // TODO implement a function to drop past events
    // public removeOldEvents() {
    //     var futureEvents: CalendarEvent[];
    //     for(var i = 0; i < this.events.length; i++) {
    //         if(!this.events[i].isExpired()) {
    //             futureEvents.append(this.events[i]);
    //         }
    //     }
    //     this.events = futureEvents;
    // }

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
        if(this.events.length > 0) {
            return this.events[this.selectedEvent];
        } else {
            return new CalendarEvent("No events", "", new MyDate(), new MyDate());
        }
    }

    public setRefocusTimeout() {
        this.clearRefocusTimeout();
        this.refocusTimeout = setTimeout(()=>{
            var e = this.selectUpcomingEvent();
            this.clearRefocusTimeout();
            // TODO: find another way to do this
            // this.clockFace.redrawAll();
        }, 5000);
    }

    public clearRefocusTimeout() {
        if(this.refocusTimeout) {
            clearTimeout(this.refocusTimeout);
        }
        this.refocusTimeout = undefined;
    }

    public hasEvents() {
        return this.events.length > 0
    }
}
