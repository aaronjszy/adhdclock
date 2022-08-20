class ClockFace {
    redrawAll(eventsObj: Events) {
        g.clear();
        Bangle.drawWidgets();
        this.draw(eventsObj);
    }

    draw(eventsObj: Events) {
        var now = new MyDate();
        var e = eventsObj.getSelectedEvent();
        if(!e) {
            E.showMessage("No events.");
            return;
        }

        var X = 176*0.5;
        var Y = 176*0.75;

        g.reset();

        // Draw current time
        g.setFontAlign(0,1);

        g.setFont("Vector", 20);
        g.drawString(e.displayName(), X, Y-60, true);
        g.setFont("Vector", 40);
        g.drawString(e.displayTimeRemaining(), X, Y, true);

        var leftTime = now.formattedTime();
        var rightTime = e.getTrackedEventDate().formattedTime();

        var midTime = e.startTime.formattedTime() + "/";
        if(midTime == rightTime || e.getTrackedEventBoundary() == TrackedEventBoundary.START) {
            midTime = "";
        }

        // Draw event info
        require("FontDennis8").add(Graphics);
        g.setFont("Dennis8", 2);
        g.setFontAlign(-1, 1);
        g.drawString(leftTime, 5, g.getHeight()-2, true);
        g.setFontAlign(1, 1);
        g.drawString(midTime + rightTime, g.getWidth()-5, g.getHeight()-2, true);

        (new Meter(e)).draw();

        // Cross out skipped items
        if(e.skipped) {
            g.drawLine(0, 0, g.getWidth(), g.getHeight());
            g.drawLine(1, 0, g.getWidth()+1, g.getHeight());
            g.drawLine(2, 0, g.getWidth()+2, g.getHeight());

            g.drawLine(g.getWidth(), 0, 0, g.getHeight());
            g.drawLine(g.getWidth()-1, 0, 0, g.getHeight()-1);
            g.drawLine(g.getWidth()-2, 0, 0, g.getHeight()-2);
        }
    }
}

class Meter {
    minutesPerSegment: number;
    maxSegmentCount: number;
    eventStart: Date;
    eventEnd: Date;
    segmentCountInt: number;
    maxMinutesInMeter: number;
    meterStartTime: Date;
    meterEndTime: Date;
    padding: number;
    height: number;
    meterTopOffsetPos: number;
    maxMeterWidth: number;

    constructor(event: CalendarEvent) {
        // Meter params
        this.minutesPerSegment = 30;
        this.maxSegmentCount = 10;

        this.eventStart = event.startTime.date;
        this.eventEnd = event.endTime.date;
        
        this.segmentCountInt = this.segmentCount(event);
        this.maxMinutesInMeter = this.segmentCountInt * this.minutesPerSegment;

        this.meterStartTime = new Date(event.getTrackedEventDate().date.getTime() + -this.maxMinutesInMeter * 60000);
        this.meterEndTime = event.getTrackedEventDate().date;

        // Draw params
        this.padding = 5;
        this.height = 22;
        this.meterTopOffsetPos = g.getHeight()*0.73;
        this.maxMeterWidth = g.getWidth() - (this.padding*2);
    }

    segmentCount(event: CalendarEvent) {
        var eventDuration = event.durationMinutes();
        var eventSegmentCount = Math.ceil(eventDuration / this.minutesPerSegment);
        if(eventSegmentCount > this.maxSegmentCount) {
            eventSegmentCount = this.maxSegmentCount;
        }

        var segmentCount = Math.ceil(event.getTrackedEventDate().minutesUntil() / this.minutesPerSegment);
        if(segmentCount <= 1) {
            segmentCount = 1;
        }
        if(segmentCount > this.maxSegmentCount) {
            segmentCount = this.maxSegmentCount;
        }

        return Math.max(eventSegmentCount, segmentCount);
    }

    draw() {
        var originalColor = g.getColor();
        
        // available time fill
        g.setColor('#00FF00');
        this.drawMeterFill(this.meterStartTime, this.meterEndTime);

        // event range
        g.setColor('#2c007d');
        this.drawMeterFill(this.eventStart, this.eventEnd);
    
        // Expended time range
        g.setColor('#FF0000');
        this.drawMeterFill(this.meterStartTime, new Date());
    
        // Draw event start indicator
        if(this.meterStartTime.getTime() < this.eventStart.getTime() && this.eventStart.getTime() < this.meterEndTime.getTime()) {
            g.setColor('#00FF00');
            let eventStartXPos = this.dateToXPos(this.eventStart);

            g.fillPoly([
                eventStartXPos, this.meterTopOffsetPos,
                eventStartXPos, this.meterTopOffsetPos+this.height,
                eventStartXPos+(this.height/2), this.meterTopOffsetPos+(this.height/2),
            ]);

            // This extra line covers up some pixels on the left that arent covered up for whatever reason
            g.drawLine(eventStartXPos-1, this.meterTopOffsetPos, eventStartXPos-1, this.meterTopOffsetPos+this.height);
        }

        // Draw the outside gauge border
        g.setColor('#000000');
        g.drawRect({x: this.padding, y: this.meterTopOffsetPos, h: this.height, w: this.maxMeterWidth});
        g.drawRect({x: this.padding+1, y: this.meterTopOffsetPos+1, h: this.height-2, w: this.maxMeterWidth-2});
    
        // Draw the segment borders
        var segmentWidth = this.maxMeterWidth / this.segmentCountInt;
        for(var i = 1; i <= this.segmentCountInt; i++) {
            var x = this.padding + (segmentWidth * i);
            g.drawLine(x, this.meterTopOffsetPos, x, this.meterTopOffsetPos+this.height);
            g.drawLine(x-1, this.meterTopOffsetPos, x-1, this.meterTopOffsetPos+this.height);
        }
    
        g.setColor(originalColor);
    }
    
    drawMeterFill(startDate: Date, endDate: Date) {
        var startXPos = this.dateToXPos(startDate);    
        var endXPos = this.dateToXPos(endDate);
        if(startXPos == endXPos) {
            return;
        }
        g.fillRect(startXPos, this.meterTopOffsetPos, endXPos, this.meterTopOffsetPos+this.height);
    }

    dateToXPos(date: Date) {
        var minute = (date.getTime() - this.meterStartTime.getTime()) / 1000 / 60;
        var percentage = minute / this.maxMinutesInMeter;
        if(percentage < 0) {
            percentage = 0;
        }
        if(percentage > 1) {
            percentage = 1;
        }
        var maxMeterWidth = g.getWidth() - (this.padding*2);
        return (maxMeterWidth * percentage) + this.padding;
    }
}
