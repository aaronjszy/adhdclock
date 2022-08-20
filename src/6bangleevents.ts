
function setupBangleEvents(clockFace: ClockFace, minuteInterval: NodeJS.Timer, eventsObj: Events) {

    Bangle.on('swipe', function(directionLR, directionUD) {
        if(directionLR == -1 && directionUD == 0) {
            eventsObj.selectNextEvent();
            clockFace.redrawAll(eventsObj);
        }
        if(directionLR == 1 && directionUD == 0) {
            eventsObj.selectPreviousEvent();
            clockFace.redrawAll(eventsObj);
        }
        if(directionUD == -1 && directionLR == 0) {
            var e = eventsObj.getSelectedEvent();
            var skipped = e.toggleSkip();
            clockFace.redrawAll(eventsObj);
            if(skipped) {
                setTimeout(()=>{
                    eventsObj.selectUpcomingEvent()
                    clockFace.redrawAll(eventsObj);    
                }, 200);
            }
        }
        if(directionUD == 1 && directionLR == 0) {
            (new CalendarUpdater(clockFace, eventsObj)).forceCalendarUpdate();
        }
    });

    Bangle.on('touch', function(button, xy) {
        if(xy.y > 50) {
            // Toggle countdown between event start and event end
            eventsObj.getSelectedEvent().toggleTrackedEventBoundary();

            // Redraw to show the updated state
            clockFace.redrawAll(eventsObj);
        }
    });

    Bangle.on('lcdPower', on => {
        if (minuteInterval) {
            clearInterval(minuteInterval);
        }
        if (on) {
            minuteInterval = setInterval(()=>{clockFace.draw(eventsObj)}, 60*1000);
            clockFace.draw(eventsObj); // draw immediately
        }
    });
}