
class MyDate {
    date: Date;

    constructor(dateStr?: string|number, timeStr?: string) {
        if(timeStr) {
            let timeParts = timeStr.split(":");
            let hourStr = (timeParts[0] == "12") ? "0" : timeParts[0];
            if(timeStr.endsWith("pm")) {
                hourStr = zeroPad((parseInt(hourStr) + 12));
            } else {
                hourStr = zeroPad(parseInt(hourStr));
            }
            let minStr = timeParts[1];
            if(minStr.length > 2) {
                minStr = minStr.substr(0, 2);
            }
            let tzStr = "-" + zeroPad((new Date()).getTimezoneOffset()/60) + "00";
            this.date = new Date(`${dateStr}T${hourStr}:${minStr}:00 GMT${tzStr}`);
        } else {
            this.date = (dateStr) ? new Date(dateStr) : new Date();
        }
    }

    valueOf(): Date {
        return this.date;
    }

    formattedTime(): string {
        var hours12 = this.date.getHours() % 12;
        hours12 = (hours12 == 0) ? 12 : hours12;
        var paddedMinute = zeroPad(this.date.getMinutes())
        return `${hours12}:${paddedMinute}`;
    }

    formattedDate(): string {
        var month = require("locale").month(this.date, 1);
        var dayOfMonth = this.date.getDate();
        return `${month} ${dayOfMonth}`;
    }

    formattedDateTime(): string {
        return `${this.formattedDate()} ${this.formattedTime()}`;
    }

    unixTimestampMillis(): number {
        return this.date.getTime();
    }

    millisUntil(): number {
        var now = new Date();
        return this.date.getTime()-now.getTime();
    }

    secondsUntil(): number {
        var now = new Date();
        return ((this.date.getTime()-now.getTime()) / 1000)+1;
    }

    minutesUntil(): number {
        var now = new Date();
        return ((this.date.getTime()-now.getTime()) / 1000 / 60)+1;
    }

    timeRemainingAsString(showSeconds: boolean): string {
        var secondsUntil = this.secondsUntil();
        var sign = (secondsUntil < 0) ? "-" : "";
        var secondsUntilAbs = Math.abs(secondsUntil)
        var totalMinutesToEventAbs = Math.floor(secondsUntilAbs / 60);
        var hoursToEventAbs = Math.floor(totalMinutesToEventAbs / 60);
        var minutesToEventAbs = totalMinutesToEventAbs % 60;

        if(hoursToEventAbs == 0) {
            if(showSeconds) {
                var secondsDisplay = zeroPad(Math.floor(secondsUntilAbs % 60));
                return `${sign}${minutesToEventAbs}:${secondsDisplay}`;
            }
            return `${sign}${minutesToEventAbs}`
        } else {
            return `${sign}${hoursToEventAbs}:${zeroPad(minutesToEventAbs)}`
        }
    }

    equals(other: MyDate): boolean {
        return this.date.getTime() == other.date.getTime();
    }
}
