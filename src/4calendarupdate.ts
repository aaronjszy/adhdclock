
class CalendarUpdater {
    clockFace: ClockFace;
    events: CalendarEvents;

    constructor(clockFace: ClockFace, events: CalendarEvents) {
        this.clockFace = clockFace;
        this.events = events;
    }

    public forceCalendarUpdate() {
        var cal = require("Storage").readJSON("android.calendar.json", true)||[];
        if(NRF.getSecurityStatus().connected) {
            E.showPrompt("Do you want to also clear the internal database first?", {
                buttons: {"Yes": 1, "No": 2, "Cancel": 3}
            }).then((v)=>{
                switch(v) {
                    case 1:
                        require("Storage").writeJSON("android.calendar.json", []);
                        cal = [];
                    case 2:
                        this.gbSend(JSON.stringify({t:"force_calendar_sync", ids: cal.map((e: any)=>e.id)}));
                        E.showAlert("Request sent to the phone").then(()=>{
                            this.readCalendarDataAndUpdate();
                            this.clockFace.redrawAll();
                        });
                        break;
                    case 3:
                    default:
                        this.readCalendarDataAndUpdate();
                        this.clockFace.redrawAll();
                        return;
                }
            });
        } else {
            E.showAlert("You are not connected").then(()=>{this.clockFace.redrawAll()});
        }
    }

    public gbSend(message: string) {
        Bluetooth.println("");
        Bluetooth.println(JSON.stringify(message));
    }
    
    public readCalendarDataAndUpdate() {
        var calendarJSON = require("Storage").readJSON("android.calendar.json",true);
        if(!calendarJSON) {
            E.showAlert("No calendar data found.").then(() => {
                E.showAlert().then(() => {
                    this.clockFace.redrawAll();
                });
            });
            return;
        } else {
            var updateCount = this.events.updateFromCalendar(calendarJSON);
            E.showAlert("Got calendar data. Updated "+updateCount+".").then(() => {
                E.showAlert().then(() => {
                    this.clockFace.redrawAll();
                });
            });
        }
    }    
}
