
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
            this.timeout = undefined;
        }
    }

    public toString(): string {
        return `${this.id} '${this.date}'`;
    }
}

class AlarmManager {
    alarms: any;

    constructor() {
        this.alarms = {};
    }

    public addAlarm(id: string, date: Date, callback: Function): Alarm {
        // console.log(`adding alarm ${id}`);
        if(this.alarms[id]) {
            this.alarms[id].cancel();
        }


        this.alarms[id] = new Alarm(id, date, callback).setup();
        return this.alarms[id];
    }

    public toString(): string {
        var s = "";
        for(var id in this.alarms) {
            s += this.alarms[id].toString() + "\n";
        }
        return s;
    }
}
