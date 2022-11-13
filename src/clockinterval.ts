
export class ClockInterval {
    private tickHandler: (clockInterval: ClockInterval) => void;

    private minuteTimeout: any;
    private minuteIntervalEnabled: boolean;

    private secondTimeout: any;
    private secondIntervalEnabled: boolean;

    constructor() {
        this.tickHandler = () => {};
        this.minuteIntervalEnabled = false;
        this.secondIntervalEnabled = false;
    }

    public setTickHandler(tickHandler: (clockInterval: ClockInterval) => void) {
        this.tickHandler = tickHandler;
    }

    // --- Minute interval functions --------------

    public enableMinuteInterval() {
        this.minuteIntervalEnabled = true;
        if(this.minuteTimeout) {
            return;
        }
        this.scheduleNextMinuteTick();
    }

    public disableMinuteInterval() {
        if(this.minuteTimeout) {
            clearInterval(this.minuteTimeout);
        }
        this.minuteTimeout = undefined;
        this.minuteIntervalEnabled = false;
    }

    private scheduleNextMinuteTick() {
        this.minuteTimeout = setTimeout(() => {
            this.tick();
        }, this.millisToNextMinute());
    }

    private millisToNextMinute() {
        const now = new Date();
        return (60*1000) - ((now.getSeconds() * 1000) + now.getMilliseconds())
    }

    private tick() {
        if(this.minuteIntervalEnabled) {
            this.scheduleNextMinuteTick();
            this.tickHandler(this);
        } else if (this.secondIntervalEnabled) {
            this.scheduleNextSecondTick();
            this.tickHandler(this);
        }
    }

    // --- Second interval functions --------------

    public isSecondIntervalEnabled(): boolean {
        return this.secondIntervalEnabled;
    }

    public enableSecondInterval() {
        this.secondIntervalEnabled = true;
        if(this.secondTimeout) {
            return;
        }
        this.scheduleNextSecondTick();
    }

    public disableSecondInterval() {
        if(this.secondTimeout) {
            clearInterval(this.secondTimeout);
        }
        this.secondTimeout = undefined;
        this.secondIntervalEnabled = false;
    }

    private scheduleNextSecondTick() {
        this.secondTimeout = setTimeout(() => {
            this.tick();
        }, this.millisToNextSecond());
    }

    private millisToNextSecond() {
        return 1000 - new Date().getMilliseconds();
    }

    // --- Toggle between second and minute intervals --------------

    public useSecondInterval() {
        if(!this.secondIntervalEnabled) {
            this.disableMinuteInterval();
            this.enableSecondInterval();
        }
    }

    public useMinuteInterval() {
        if(!this.minuteIntervalEnabled) {
            this.disableSecondInterval();
            this.enableMinuteInterval();
        }
    }

    public toggleBetweenSecondAndMinuteIntervals() {
        if(this.minuteIntervalEnabled) {
            this.useSecondInterval();
        } else {
            this.useMinuteInterval();
        }
    }
}
