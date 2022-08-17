
class CalendarUpdater {
    clockFace: ClockFace;
    events: Events;

    constructor(clockFace: ClockFace, events: Events) {
        this.clockFace = clockFace;
        this.events = events;
    }

    forceCalendarUpdate() {
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
                        this.gbSend({t:"force_calendar_sync", ids: cal.map(e=>e.id)});
                        E.showAlert("Request sent to the phone").then(this.readCalendarDataAndUpdate);
                        break;
                    case 3:
                    default:
                        this.clockFace.redrawAll(this.events);
                        return;
                }
            });
        } else {
            E.showAlert("You are not connected").then(this.clockFace.redrawAll);
        }
    }

    gbSend(message) {
        Bluetooth.println("");
        Bluetooth.println(JSON.stringify(message));
    }
    
    readCalendarDataAndUpdate() {
        var calendarJSON = require("Storage").readJSON("android.calendar.json",true);
        if(!calendarJSON) {
            E.showAlert("No calendar data found.").then(function() {
                E.showAlert().then(function() {
                    this.clockFace.redrawAll(this.events);
                });
            });
            return;
        } else {
            var updateCount = this.events.updateFromCalendar(calendarJSON);
            E.showAlert("Got calendar data. Updated "+updateCount+".").then(function() {
                E.showAlert().then(function() {
                    this.clockFace.redrawAll(this.events);
                });
            });
        }
    }    
}

