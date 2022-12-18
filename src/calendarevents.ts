import * as date from "./date";
import { CalendarEvent } from "./calendarevent";

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
        try {
            var file = require("Storage").open("adhdclock.events","r");
            if(file) {
                var data = file.read(file.getLength());
                if(data) {
                    var restoredObject = JSON.parse(data);
                    this.events = []
                    if(restoredObject.events) {
                        for(var i = 0; i < restoredObject.events.length; i++) {
                            this.events[i] = CalendarEvent.fromJSON(restoredObject.events[i]);
                        }
                        if(restoredObject.selectedEvent) {
                            this.selectedEvent = restoredObject.selectedEvent;
                        }
                    }
                }
            }
        } catch(e) {
            console.log("Error restoring calendar events: " + e);
        }
        return this
    }

    public updateFromCalendar(calendar: any) {
        let calendarIDs: { [name: string]: boolean } = {};
        for(var i = 0; i < calendar.length; i++) {
            if(this.addCalendarEvent(calendar[i])) {
                calendarIDs[calendar[i].id] = true;
            }
        }

        // Remove existing events that were not just selected from the calendar
        this.events = this.events.filter((e) => {
            return (e.id && calendarIDs[e.id])
        });

        this.organize();
    }

    public addCalendarEvent(calendarEvent: any): boolean {
        var now = new Date();
        var eventTimeWindowMillis = 1000*60*60*24; // 24 hours

        var calStartEventTimeMillis = calendarEvent.timestamp*1000;
        var calEndEventTimeMillis = (calendarEvent.timestamp+calendarEvent.durationInSeconds)*1000;

        // Calendar event is within 24 hours of the current time
        if (calEndEventTimeMillis > (now.getTime()+eventTimeWindowMillis) || calEndEventTimeMillis < (now.getTime()-eventTimeWindowMillis))
            return false;
        // Ignore events without required fields / values
        if(calendarEvent.t != "calendar" || !calendarEvent.title || calendarEvent.title == "" || calendarEvent.type != 0)
            return false;
        // Ignore all day events
        if(calendarEvent.allDay || calendarEvent.durationInSeconds == 86400)
            return false;

        var newEvent = new CalendarEvent(
            calendarEvent.id, 
            calendarEvent.title, 
            calendarEvent.description, 
            new date.EventDate(calStartEventTimeMillis), 
            new date.EventDate(calEndEventTimeMillis)
        ).registerAlarm();
        this.upsertEvent(newEvent);

        return true;
    }

    public removeCalendarEvent(eventID: number) {
        this.events = this.events.filter((e) => {
            var isMatch = e.id == eventID;
            if(isMatch) {
                e.unregisterAlarm();
            }
            return !isMatch;
        });
    }

    public organize() {
        this.dedup();
        this.sort();
        this.selectUpcomingEvent();
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
                    // only unregister the alarm for the duplicate event if it has a unique id
                    // otherwise we will unregister the alarm for the original event
                    if(e.id != e2.id) {
                        e2.unregisterAlarm();
                    }

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
            if(e.id == event.id) {
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

    public selectUpcomingEvent(): CalendarEvent | undefined {
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

    public getSelectedEvent(): CalendarEvent | undefined {
        if(this.events.length > 0) {
            var calendarEvent = this.events[this.selectedEvent];
            if(calendarEvent) {
                return calendarEvent;
            }
        }
        return undefined;
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
