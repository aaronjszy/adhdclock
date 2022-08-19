
class CalendarUpdater {
    clockFace: ClockFace;
    events: Events;

    constructor(clockFace: ClockFace, events: Events) {
        this.clockFace = clockFace;
        this.events = events;
        console.log("1", this.events);
    }

    public forceCalendarUpdate() {
        console.log("2", this.events);
        var cal = require("Storage").readJSON("android.calendar.json", true)||[];
        if(NRF.getSecurityStatus().connected) {
            E.showPrompt("Do you want to also clear the internal database first?", {
                buttons: {"Yes": 1, "No": 2, "Cancel": 3}
            }).then((v)=>{
                console.log("3", this.events);
                switch(v) {
                    case 1:
                        require("Storage").writeJSON("android.calendar.json", []);
                        cal = [];
                    case 2:
                        console.log("4", this.events);
                        this.gbSend(JSON.stringify({t:"force_calendar_sync", ids: cal.map((e: any)=>e.id)}));
                        E.showAlert("Request sent to the phone").then(()=>{this.readCalendarDataAndUpdate()});
                        break;
                    case 3:
                    default:
                        this.clockFace.redrawAll(this.events);
                        return;
                }
            });
        } else {
            E.showAlert("You are not connected").then(()=>{this.clockFace.redrawAll(this.events)});
        }
    }

    public gbSend(message: string) {
        Bluetooth.println("");
        Bluetooth.println(JSON.stringify(message));
    }
    
    public readCalendarDataAndUpdate() {
        console.log("5", this.events);
        var calendarJSON = require("Storage").readJSON("android.calendar.json",true);
        if(!calendarJSON) {
            E.showAlert("No calendar data found.").then(() => {
                E.showAlert().then(() => {
                    console.log("6", this.events);
                    this.clockFace.redrawAll(this.events);
                });
            });
            return;
        } else {
            var updateCount = this.events.updateFromCalendar(calendarJSON);
            E.showAlert("Got calendar data. Updated "+updateCount+".").then(() => {
                E.showAlert().then(() => {
                    console.log("7", this.events);
                    this.clockFace.redrawAll(this.events);
                });
            });
        }
    }    
}
