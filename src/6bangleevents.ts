
function setupBangleEvents(clockFace: ClockFace, minuteInterval: NodeJS.Timer, eventsObj: CalendarEvents) {

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

    var ignoreTouch = false;
    Bangle.on('touch', function(button, xy) {
        // This ignore touch makes it so that touch events are not registered for clicking buttons
        if(ignoreTouch) {
            return;
        }

        // Bottom bar
        if(xy.y > g.getHeight() - 50) {
            // Toggle countdown between event start and event end
            eventsObj.getSelectedEvent().toggleTrackedEventBoundary();

            // Redraw to show the updated state
            clockFace.redrawAll(eventsObj);

        // Top area except for gadgets
        } else if(xy.y > 50) {
            ignoreTouch = true;
            // Display event details
            // Deploy the prompt so we dont immediately get a touch event that clicks the ok button
            setTimeout(()=>{
                E.showPrompt(eventsObj.getSelectedEvent().displayDescription(), {
                    buttons: {Ok: 1}
                }).then(()=>{
                    ignoreTouch = false;
                    clockFace.redrawAll(eventsObj);
                });
            }, 200);
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