import { ClockFace } from './clockface';
import { CalendarEvents } from './calendarevents';

export function setupBangleEvents(clockFace: ClockFace, eventsObj: CalendarEvents) {
    // When button is pressed save state and open the launcher
    setWatch(() => {
        eventsObj.save();
        Bangle.showLauncher();
    }, BTN1, {repeat:false,edge:"falling"});

    Bangle.on('swipe', function(directionLR, directionUD) {
        if(directionLR == -1 && directionUD == 0) {
            eventsObj.selectNextEvent();
            clockFace.redrawAll();
        }
        if(directionLR == 1 && directionUD == 0) {
            eventsObj.selectPreviousEvent();
            clockFace.redrawAll();
        }
        if(directionUD == -1 && directionLR == 0) {
            var e = eventsObj.getSelectedEvent();
            if(e) {
                var skipped = e.toggleSkip();
                clockFace.redrawAll();
                if(skipped) {
                    setTimeout(()=>{
                        eventsObj.selectUpcomingEvent()
                        clockFace.redrawAll();    
                    }, 200);
                }
            }
        }
    });

    var ignoreTouch = false;
    Bangle.on('touch', function(_, xy) {
        if(!xy) {
            return;
        }

        // This ignore touch makes it so that touch events are not registered for clicking buttons
        if(ignoreTouch) {
            return;
        }

        // Bottom bar
        if(xy.y > g.getHeight() - 50) {
            // Toggle countdown between event start and event end
            var e = eventsObj.getSelectedEvent();
            if(e) {
                e.toggleTrackedEventBoundary();
            }

            // Redraw to show the updated state
            clockFace.redrawAll();

        // Top area except for gadgets
        } else if(xy.y > 50) {
            ignoreTouch = true;
            // Display event details
            // Deploy the prompt so we dont immediately get a touch event that clicks the ok button
            setTimeout(()=>{
                var e = eventsObj.getSelectedEvent();
                if(e) {
                    E.showPrompt(e.displayDescription(), {
                        buttons: {Ok: 1}
                    }).then(()=>{
                        ignoreTouch = false;
                        clockFace.redrawAll();
                    });
                }
            }, 200);
        }
    });
}
