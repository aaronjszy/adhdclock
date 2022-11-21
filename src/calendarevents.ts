import * as date from "./date";

export enum TrackedEventBoundary {
    START,
    END,
}

export class CalendarEvent {
    calendarEventId: number | undefined;
    name: string;
    description: string;
    startTime: date.EventDate;
    endTime: date.EventDate;
    skipped: boolean;
    trackedEventBoundary: TrackedEventBoundary;

    constructor(name: string, description: string, startTime: date.EventDate, endTime: date.EventDate) {
        this.name = name;
        this.description = description;
        this.startTime = startTime;
        this.endTime = endTime;
        this.skipped = false;
        this.calendarEventId = undefined;
        this.trackedEventBoundary = TrackedEventBoundary.END;
    }

    public static fromJSON(json: any): CalendarEvent {
        var e = new CalendarEvent(json.name, json.description, new date.EventDate(json.startTime.date), new date.EventDate(json.endTime.date))
        e.skipped = json.skipped
        e.calendarEventId = json.calendarEventId
        e.trackedEventBoundary = json.trackedEventBoundary
        return e
    }

    public update(event: CalendarEvent): boolean {
        // This check is here just in case the provided event is not the same as this event. This should not happen.
        if(event.calendarEventId != this.calendarEventId) {
            return false;
        }

        // set equivalent event properties for fields we dont want included in the isModified check
        event.calendarEventId = this.calendarEventId;
        event.skipped = this.skipped;
        event.trackedEventBoundary = this.trackedEventBoundary;

        var isModified = JSON.stringify(event, undefined, undefined) != JSON.stringify(this, undefined, undefined);

        // Update the event properties from the provided matching event
        // Note that were not updating the event id
        this.name = event.name;
        this.description = event.description;
        this.startTime = event.startTime;
        this.endTime = event.endTime;

        return isModified;
    }

    public setBangleCalendarEventId(calendarEventId: number) {
        this.calendarEventId = calendarEventId;
    }

    public toggleSkip(): boolean {
        this.skipped = !this.skipped;
        return this.skipped
    }

    public toggleTrackedEventBoundary() {
        this.trackedEventBoundary = (this.trackedEventBoundary == TrackedEventBoundary.END) ? TrackedEventBoundary.START : TrackedEventBoundary.END;
    }

    public getTrackedEventBoundary(): TrackedEventBoundary {
        // Change the tracked event event boundary from start to end if the start time has already elapsed
        // if(this.trackedEventBoundary == TrackedEventBoundary.START && this.startTime.secondsUntil() < 0) {
        //     this.trackedEventBoundary = TrackedEventBoundary.END
        // }
        return this.trackedEventBoundary;
    }

    public getTrackedEventDate(): date.EventDate {
        if(this.trackedEventBoundary == TrackedEventBoundary.START) {
            return this.startTime;
        }
        return this.endTime;
    }

    public displayName(): string {
        return this.name.substr(0, 14);
    }

    public displayDescription(): string {
        if(this.description.length == 0) {
            return "empty";
        }
        if(this.displayDescription.length > 50) {
            return this.description.substr(0, 50) + "...";
        }

        return this.description;
    }

    public displayTimeRemaining(): string {
        return this.getTrackedEventDate().timeRemainingAsString();
    }

    public displaySecondsRemaining(): string {
        return this.getTrackedEventDate().secondsRemainingAsString();
    }

    public durationMinutes(): number {
        var durationMillis = this.endTime.unixTimestampMillis() - this.startTime.unixTimestampMillis()
        return durationMillis / 1000 / 60;
    }

    public isExpired(): boolean{
        return false;
    }
}

export class CalendarEvents {
    selectedEvent: number;
    events: CalendarEvent[];
    refocusTimeout: any;

    constructor(events: CalendarEvent[]) {
        this.selectedEvent = 0;
        this.events = events;
        this.refocusTimeout = undefined;
    }

    public save() {
        var file = require("Storage").open("adhdclock.events","w");
        file.write(JSON.stringify(this, undefined, undefined));
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
        var eventTimeWindowMillis = 1000*60*60*24; // 24 hours

        let calendarIDs: { [name: string]: boolean } = {};
        
        for(var i = 0; i < calendar.length; i++) {
            var calendarEvent = calendar[i];
            var calStartEventTimeMillis = calendarEvent.timestamp*1000;
            var calEndEventTimeMillis = (calendarEvent.timestamp+calendarEvent.durationInSeconds)*1000;

            // Calendar event is within 24 hours of the current time
            if (calEndEventTimeMillis > (now.getTime()+eventTimeWindowMillis) || calEndEventTimeMillis < (now.getTime()-eventTimeWindowMillis))
                continue;
            // Ignore events without required fields / values
            if(calendarEvent.t != "calendar" || !calendarEvent.title || calendarEvent.title == "" || calendarEvent.type != 0)
                continue;
            // Ignore all day events
            if(calendarEvent.allDay || calendarEvent.durationInSeconds == 86400)
                continue;

            var newEvent = new CalendarEvent(calendarEvent.title, calendarEvent.description, new date.EventDate(calStartEventTimeMillis), new date.EventDate(calEndEventTimeMillis));
            newEvent.setBangleCalendarEventId(calendarEvent.id);
            if(this.upsertEvent(newEvent)) {
                updated++;
            }

            calendarIDs[calendarEvent.id] = true;
        }

        // Remove existing events that were not just selected from the calendar
        this.events = this.events.filter((e) => {
            return (e.calendarEventId && calendarIDs[e.calendarEventId])
        });

        this.dedup();
        this.sort();
        this.selectUpcomingEvent();

        return updated;
    }

    private sort() {
        this.events = this.events.sort((e1, e2) => {
            return e1.endTime.unixTimestampMillis() - e2.endTime.unixTimestampMillis();
        });
    }

    private dedup() {
        for(var i = 0; i < this.events.length; i++) {
            var e = this.events[i];
            if(!e) {
                continue;
            }
            for(var j = i+1; j < this.events.length; j++) {
                var e2 = this.events[j];
                if(!e2) continue;
                if(e.name == e2.name && e.startTime.date.getTime() == e2.startTime.date.getTime() && e.endTime.date.getTime() == e2.endTime.date.getTime()) {
                    this.events.splice(j, 1);
                    j--;
                }
            }
        }
    }

    public upsertEvent(event: CalendarEvent): boolean {
        for(var i = 0; i < this.events.length; i++) {
            var e = this.events[i];
            if(!e) {
                continue;
            }
            if(e.calendarEventId == event.calendarEventId) {
                return e.update(event);
            }
        }
        this.events.push(event);
        return true;
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

    public selectUpcomingEvent(): CalendarEvent {
        this.selectedEvent = this.getUpcomingEventIndex();
        return this.getSelectedEvent();
    }

    private getUpcomingEventIndex(): number {
        var soonestEventSeconds = Number.MAX_VALUE;
        var soonestEventIndex = this.events.length-1;
        for(var i = 0; i < this.events.length; i++) {
            var e = this.events[i];
            if(!e) {
                continue;
            }

            var nextEventSeconds = e.endTime.secondsUntil();
            if(!e.skipped && nextEventSeconds >= 0 && nextEventSeconds < soonestEventSeconds) {
                soonestEventSeconds = e.endTime.secondsUntil();
                soonestEventIndex = i
            }
        }

        return soonestEventIndex;
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

    public getSelectedEvent(): CalendarEvent {
        if(this.events.length > 0) {
            var calendarEvent = this.events[this.selectedEvent];
            if(calendarEvent) {
                return calendarEvent;
            } else {
                return new CalendarEvent("undefined", "", new date.EventDate(), new date.EventDate());
            }
        } else {
            return new CalendarEvent("No events", "", new date.EventDate(), new date.EventDate());
        }
    }

    public setRefocusTimeout() {
        this.clearRefocusTimeout();
        this.refocusTimeout = setTimeout(()=>{
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
}
