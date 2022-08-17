var MyDate = /** @class */ (function () {
    function MyDate(dateStr) {
        this.date = (dateStr) ? new Date(dateStr) : new Date();
    }
    MyDate.prototype.valueOf = function () {
        return this.date;
    };
    MyDate.prototype.formattedTime = function () {
        var hours12 = this.date.getHours() % 12;
        hours12 = (hours12 == 0) ? 12 : hours12;
        var paddedMinute = zeroPad(this.date.getMinutes());
        return "".concat(hours12, ":").concat(paddedMinute);
    };
    MyDate.prototype.formattedDate = function () {
        var month = require("locale").month(this.date, 1);
        var dayOfMonth = this.date.getDate();
        return "".concat(month, " ").concat(dayOfMonth);
    };
    MyDate.prototype.formattedDateTime = function () {
        return "".concat(this.formattedDate(), " ").concat(this.formattedTime());
    };
    MyDate.prototype.unixTimestampMillis = function () {
        return this.date.getTime();
    };
    MyDate.prototype.totalMillisToEvent = function () {
        var now = new Date();
        return this.date.getTime() - now.getTime();
    };
    MyDate.prototype.totalSecondsToEvent = function () {
        var now = new Date();
        return ((this.date.getTime() - now.getTime()) / 1000) + 1;
    };
    MyDate.prototype.minutesUntil = function () {
        var now = new Date();
        return ((this.date.getTime() - now.getTime()) / 1000 / 60) + 1;
    };
    MyDate.prototype.timeRemainingAsString = function () {
        var totalSecondsToEvent = this.totalSecondsToEvent();
        var sign = (totalSecondsToEvent < 0) ? "-" : "";
        var totalSecondsToEventAbs = Math.abs(totalSecondsToEvent);
        var totalMinutesToEventAbs = Math.floor(totalSecondsToEventAbs / 60);
        var hoursToEventAbs = Math.floor(totalMinutesToEventAbs / 60);
        var minutesToEventAbs = totalMinutesToEventAbs % 60;
        if (hoursToEventAbs == 0) {
            return "".concat(sign).concat(minutesToEventAbs);
        }
        else {
            return "".concat(sign).concat(hoursToEventAbs, ":").concat(zeroPad(minutesToEventAbs));
        }
    };
    MyDate.prototype.equals = function (other) {
        return this.date.getTime() == other.date.getTime();
    };
    return MyDate;
}());
