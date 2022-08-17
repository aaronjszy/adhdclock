var CalendarUpdater = /** @class */ (function () {
    function CalendarUpdater(clockFace, events) {
        this.clockFace = clockFace;
        this.events = events;
    }
    CalendarUpdater.prototype.forceCalendarUpdate = function () {
        var _this = this;
        var cal = require("Storage").readJSON("android.calendar.json", true) || [];
        if (NRF.getSecurityStatus().connected) {
            E.showPrompt("Do you want to also clear the internal database first?", {
                buttons: { "Yes": 1, "No": 2, "Cancel": 3 }
            }).then(function (v) {
                switch (v) {
                    case 1:
                        require("Storage").writeJSON("android.calendar.json", []);
                        cal = [];
                    case 2:
                        _this.gbSend({ t: "force_calendar_sync", ids: cal.map(function (e) { return e.id; }) });
                        E.showAlert("Request sent to the phone").then(_this.readCalendarDataAndUpdate);
                        break;
                    case 3:
                    default:
                        _this.clockFace.redrawAll(_this.events);
                        return;
                }
            });
        }
        else {
            E.showAlert("You are not connected").then(this.clockFace.redrawAll);
        }
    };
    CalendarUpdater.prototype.gbSend = function (message) {
        Bluetooth.println("");
        Bluetooth.println(JSON.stringify(message));
    };
    CalendarUpdater.prototype.readCalendarDataAndUpdate = function () {
        var calendarJSON = require("Storage").readJSON("android.calendar.json", true);
        if (!calendarJSON) {
            E.showAlert("No calendar data found.").then(function () {
                E.showAlert().then(function () {
                    this.clockFace.redrawAll(this.events);
                });
            });
            return;
        }
        else {
            var updateCount = this.events.updateFromCalendar(calendarJSON);
            E.showAlert("Got calendar data. Updated " + updateCount + ".").then(function () {
                E.showAlert().then(function () {
                    this.clockFace.redrawAll(this.events);
                });
            });
        }
    };
    return CalendarUpdater;
}());
