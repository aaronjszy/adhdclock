import * as date from "./date";
import { Alarm } from "./alarm";

export enum TrackedEventBoundary {
    START,
    END,
}

export class CalendarEvent {
    id: number;
    name: string;
    description: string;
    startTime: date.EventDate;
    endTime: date.EventDate;
    skipped: boolean;
    trackedEventBoundary: TrackedEventBoundary;
    startEventAlarm: Alarm;

    constructor(id: number, name: string, description: string, startTime: date.EventDate, endTime: date.EventDate) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.startTime = startTime;
        this.endTime = endTime;
        this.skipped = false;
        this.trackedEventBoundary = this.getTrackedEventBoundary();
        this.startEventAlarm = new Alarm(id, this.name, this.startTime);
    }

    public registerAlarm(): CalendarEvent {
        this.startEventAlarm.register();
        return this;
    }

    public unregisterAlarm(): void {
        this.startEventAlarm.unregister();
    }

    public static fromJSON(json: any): CalendarEvent {
        var e = new CalendarEvent(json.id, json.name, json.description, new date.EventDate(json.startTime.date), new date.EventDate(json.endTime.date))
        e.skipped = json.skipped;
        e.trackedEventBoundary = json.trackedEventBoundary;

        // Not explicitly registering the alarm here, this would have already been handled when the event was originally created.
        // this ensures that we dont mistakenly register alarms for anything that should not have an alarm.

        return e
    }

    public update(event: CalendarEvent): boolean {
        // This check is here just in case the provided event is not the same as this event. This should not happen.
        if(event.id != this.id) {
            return false;
        }

        // set equivalent event properties for fields we dont want included in the isModified check
        event.id = this.id;
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

    public toggleSkip(): boolean {
        this.skipped = !this.skipped;
        return this.skipped;
    }

    public toggleTrackedEventBoundary() {
        if(this.eventStartElapsed()) {
            this.trackedEventBoundary = TrackedEventBoundary.END;
        } else {
            this.trackedEventBoundary = (this.trackedEventBoundary == TrackedEventBoundary.END) ? TrackedEventBoundary.START : TrackedEventBoundary.END;
        }
    }

    public getTrackedEventBoundary(): TrackedEventBoundary {
        if(!this.trackedEventBoundary) {
            this.trackedEventBoundary = TrackedEventBoundary.START;
        }

        if(this.eventStartElapsed()) {
            this.trackedEventBoundary = TrackedEventBoundary.END;
        }

        return this.trackedEventBoundary;
    }

    public getTrackedEventDate(): date.EventDate {
        if(this.getTrackedEventBoundary() == TrackedEventBoundary.START) {
            return this.startTime;
        }
        return this.endTime;
    }

    private eventStartElapsed(): boolean {
        return this.startTime.secondsUntil() <= 0;
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
