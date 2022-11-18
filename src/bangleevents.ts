import { ClockFace } from './clockface';
import { CalendarUpdater } from './calendarupdate';
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
            var skipped = e.toggleSkip();
            clockFace.redrawAll();
            if(skipped) {
                setTimeout(()=>{
                    eventsObj.selectUpcomingEvent()
                    clockFace.redrawAll();    
                }, 200);
            }
        }
        if(directionUD == 1 && directionLR == 0) {
            (new CalendarUpdater(clockFace, eventsObj)).forceCalendarUpdate();
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
            eventsObj.getSelectedEvent().toggleTrackedEventBoundary();

            // Redraw to show the updated state
            clockFace.redrawAll();

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
                    clockFace.redrawAll();
                });
            }, 200);
        }
    });

    (function() {
        var _GB = global.GB;
        global.GB = function(j: any) {
          switch (j.t) {
            case "calendar":
              console.log(j.id + ": " + j.title);
              // @ts-ignore
              Terminal.println(j.id + ": " + j.title);
              break;
          }
          if (_GB)_GB(j);
        };
      })();
}
