
export class ClockInterval {
    private tickHandler: () => void;

    constructor(tickHandler: () => void) {
        this.tickHandler = tickHandler;
    }

    public scheduleNextMinuteTick() {
        setTimeout(() => {
            this.tickHandler();
        }, this.millisToNextMinute());
    }

    private millisToNextMinute() {
        const now = new Date();
        return (60*1000) - ((now.getSeconds() * 1000) + now.getMilliseconds())
    }

    public scheduleNextSecondTick() {
        setTimeout(() => {
            this.tickHandler();
        }, this.millisToNextSecond());
    }

    private millisToNextSecond() {
        return 1000 - new Date().getMilliseconds();
    }
}
