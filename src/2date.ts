
class MyDate {
    date: Date;

    constructor(dateStr?: string|number) {
        this.date = (dateStr) ? new Date(dateStr) : new Date();
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

    totalMillisToEvent(): number {
        var now = new Date();
        return this.date.getTime()-now.getTime();
    }

    totalSecondsToEvent(): number {
        var now = new Date();
        return ((this.date.getTime()-now.getTime()) / 1000)+1;
    }

    minutesUntil(): number {
        var now = new Date();
        return ((this.date.getTime()-now.getTime()) / 1000 / 60)+1;
    }

    timeRemainingAsString(): string {
        var totalSecondsToEvent = this.totalSecondsToEvent();
        var sign = (totalSecondsToEvent < 0) ? "-" : "";
        var totalSecondsToEventAbs = Math.abs(totalSecondsToEvent)
        var totalMinutesToEventAbs = Math.floor(totalSecondsToEventAbs / 60);
        var hoursToEventAbs = Math.floor(totalMinutesToEventAbs / 60);
        var minutesToEventAbs = totalMinutesToEventAbs % 60;

        if(hoursToEventAbs == 0) {
            return `${sign}${minutesToEventAbs}`
        } else {
            return `${sign}${hoursToEventAbs}:${zeroPad(minutesToEventAbs)}`
        }
    }

    equals(other: MyDate): boolean {
        return this.date.getTime() == other.date.getTime();
    }
}
