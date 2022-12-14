import { zeroPad } from "./util";

export class EventDate {
    date: Date;

    constructor(dateStr?: string|number, timeStr?: string) {
        if(timeStr) {
            let timeParts = timeStr.split(":");
            let hourStr = (timeParts[0] == "12") ? "0" : timeParts[0];
            if(timeStr.endsWith("pm", undefined)) {
                hourStr = zeroPad((parseInt(hourStr, 10) + 12));
            } else {
                hourStr = zeroPad(parseInt(hourStr, 10));
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

    floorMinutes() {
        this.date.setMinutes(0, 0, 0);
    }

    addMinutes(minutes: number) {
        this.date = new Date(this.date.getTime() + minutes*60000);
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

    millisSinceMidnight(): number {
        return this.date.getTime() - new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate()).getTime();
    }

    dateStr(): string {
        return this.date.getFullYear() + "-" + zeroPad(this.date.getMonth()+1) + "-" + zeroPad(this.date.getDate());
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

    timeRemainingAsString(): string {
        var secondsUntil = this.secondsUntil();
        var totalMinutesToEvent = Math.floor(secondsUntil / 60);
        var sign = (totalMinutesToEvent < 0) ? "-" : "";
        var hoursToEventAbs = Math.floor(Math.abs(totalMinutesToEvent) / 60);
        var minutesToEventAbs = Math.abs(totalMinutesToEvent % 60);
        if (hoursToEventAbs == 0) {
            return `${sign}${minutesToEventAbs}`;
        } else {
            return `${sign}${hoursToEventAbs}:${zeroPad(minutesToEventAbs)}`;
        }
    }

    secondsRemainingAsString(): string {
        var secondsUntil = this.secondsUntil();
        var secondsUntilAbs = Math.abs(secondsUntil)
        var secondsDisplay = zeroPad(Math.floor(secondsUntilAbs % 60));
        return `${secondsDisplay}`;
    }

    string(): string{
        return this.date.getFullYear() + "-" + zeroPad(this.date.getMonth()+1) + "-" + zeroPad(this.date.getDate()) + " " + zeroPad(this.date.getHours()) + ":" + zeroPad(this.date.getMinutes()) + ":" + zeroPad(this.date.getSeconds());
    }

    equals(other: EventDate): boolean {
        return this.date.getTime() == other.date.getTime();
    }
}
