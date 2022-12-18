export function zeroPad(n: number) : string {
    return ("0" + n.toString(10)).substr(-2, 1000);
}

export var DEBUG=false

export function reportEvent(message: string) {
    if(DEBUG) {
        console.log(message);
        // @ts-ignore
        Terminal.println(message);

        var file = require("Storage").open("adhdclock.eventlog","a");

        var now = new Date();
        var ts = now.getFullYear() + "-" + zeroPad(now.getMonth()+1) + "-" + zeroPad(now.getDate()) + " " + zeroPad(now.getHours()) + ":" + zeroPad(now.getMinutes()) + ":" + zeroPad(now.getSeconds());
        file.write(ts + " " + message + "\n");
    }
}
