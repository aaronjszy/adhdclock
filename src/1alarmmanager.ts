
class Alarm {
    id: string;
    date: Date;
    callback: Function;
    timeout: NodeJS.Timeout | undefined;

    constructor(id: string, date: Date, callback: Function) {
        this.id = id;
        this.date = date;
        this.callback = callback;
        this.timeout = undefined;
    }

    public setup(): Alarm {
        this.cancel();
        this.timeout = setTimeout(() => {
            this.callback();
        }, this.date.getTime() - new Date().getTime());
        return this;
    }

    public cancel() {
        if(this.timeout) {
            clearTimeout(this.timeout);
        }
    }

    public toString(): string {
        return `${this.id} '${this.date.toLocaleString()}'`;
    }
}

class AlarmManager {
    alarms: any;

    constructor() {
        this.alarms = {};
    }

    public addAlarm(id: string, date: Date, callback: Function): Alarm {
        var alarm = new Alarm(id, date, callback).setup();
        let a = this.alarms[id];
        if(a) {
            a.cancel();
        }
        this.alarms[id] = alarm;
        return alarm;
    }

    public toString(): string {
        var s = "";
        for(var id in this.alarms) {
            s += this.alarms[id].toString() + "\n";
        }
        return s;
    }
}
