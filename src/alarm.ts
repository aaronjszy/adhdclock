import { EventDate } from "./date";

export class Alarm {
    alarmDef: any;
    date: EventDate;

    constructor(id: number, msg: string, date: EventDate) {
        console.log(`creating alarm instance: id=${id} date=${date.string()} msg=${msg}`);
        this.date = date;
        this.alarmDef =  {
            id: id,
            msg: msg,
            date: date.dateStr(),
            t: date.millisSinceMidnight(),
            appid: "adhdclock",
            on: true,
            rp: false,
            vibrate: "-", // pattern of '.', '-' and ' ' to use for when buzzing out this alarm (defaults to '..' if not set)
            hidden: true,
            del: true,
            as: false,
            js: "load('sched.js')"
        };
    }

    public register(): Alarm {
        if(!this.alarmDef.id) {
            throw new Error("Cannot register alarm without eventid.");
        }
        
        // dont register the alarm if its in the past.
        // If we did, then when the alarm is acked, the app 
        // would reload, the alarm would be re-registered, and the alarm 
        // would go off again and again within the same minute
        if(this.date.millisUntil() > 0) {
            const sched = require("sched")
            sched.setAlarm(this.alarmDef.id, this.alarmDef);
            sched.reload();
        }
        return this;
    }

    public unregister() {
        console.log("unregistering alarm " + this.alarmDef.id);
        const sched = require("sched")
        sched.setAlarm(this.alarmDef.id, undefined);
        sched.reload();
    }

    // require("sched").getAlarms().filter((a) => (a.appid == "adhdclock"));
}
