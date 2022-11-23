import { ClockFace } from './clockface';
import { CalendarEvents } from './calendarevents';
import { reportEvent } from './util';

export class CalendarUpdater {
    clockFace: ClockFace;
    events: CalendarEvents;

    constructor(clockFace: ClockFace, events: CalendarEvents) {
        this.clockFace = clockFace;
        this.events = events;
    }

    public forceCalendarSync() {
        if(NRF.getSecurityStatus().connected) {
            reportEvent("forceCalendarSync");
            var cal = require("Storage").readJSON("android.calendar.json",true);
            if (!cal || !Array.isArray(cal)) cal = [];
            this.gbSend({t:"force_calendar_sync", ids: cal.map((e: { id: any; })=>e.id)});
        }
    }

    public gbSend(jsonMessage: any) {
        var message = JSON.stringify(jsonMessage, undefined, undefined);
        reportEvent("gbSend: " + message);

        // @ts-ignore
        Bluetooth.println("");
        // @ts-ignore
        Bluetooth.println(message);
    }
    
    public readCalendarDataAndUpdate() {
        reportEvent("readCalendarDataAndUpdate");
        this.forceCalendarSync();

        var calendarJSON = require("Storage").readJSON("android.calendar.json",true);
        if(!calendarJSON) {
            E.showAlert("No calendar data found.").then(() => {
                E.showAlert().then(() => {
                    this.clockFace.redrawAll();
                });
            });
        } else {
            this.events.updateFromCalendar(calendarJSON);
            this.clockFace.redrawAll();
        }
    }    
}
