import { ClockFace } from './clockface';
import { CalendarEvents } from './calendarevents';

export class CalendarUpdater {
    clockFace: ClockFace;
    events: CalendarEvents;

    constructor(clockFace: ClockFace, events: CalendarEvents) {
        this.clockFace = clockFace;
        this.events = events;
    }

    public forceCalendarUpdate() {
        if(NRF.getSecurityStatus().connected) {
            this.gbSend(JSON.stringify({t:"force_calendar_sync", ids: []}, undefined, undefined));
            E.showAlert("Request sent to the phone").then(()=>{
                this.clockFace.redrawAll();
            });
        } else {
            E.showAlert("You are not connected").then(()=>{
                this.clockFace.redrawAll()
            });
        }
    }

    public gbSend(message: string) {
        // @ts-ignore
        Bluetooth.println("");
        // @ts-ignore
        Bluetooth.println(JSON.stringify(message, undefined, undefined));
    }
    
    public readCalendarDataAndUpdate() {
        this.events.removeExpiredEvents();

        var calendarJSON = require("Storage").readJSON("android.calendar.json",true);
        if(!calendarJSON) {
            E.showAlert("No calendar data found.").then(() => {
                E.showAlert().then(() => {
                    this.clockFace.redrawAll();
                });
            });
            return;
        } else {
            this.events.updateFromCalendar(calendarJSON);
            this.clockFace.redrawAll();
        }
    }    
}
