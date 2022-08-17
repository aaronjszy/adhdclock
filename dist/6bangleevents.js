function setupBangleEvents(clockFace, minuteInterval, eventsObj) {
    Bangle.on('swipe', function (directionLR, directionUD) {
        if (directionLR == -1 && directionUD == 0) {
            eventsObj.selectNextEvent();
            clockFace.redrawAll(eventsObj);
        }
        if (directionLR == 1 && directionUD == 0) {
            eventsObj.selectPreviousEvent();
            clockFace.redrawAll(eventsObj);
        }
        if (directionUD == -1 && directionLR == 0) {
            var e = eventsObj.getSelectedEvent();
            var skipped = e.toggleSkip();
            clockFace.redrawAll(eventsObj);
            if (skipped) {
                setTimeout(function () {
                    eventsObj.selectUpcomingEvent();
                    clockFace.redrawAll(eventsObj);
                }, 200);
            }
        }
        if (directionUD == 1 && directionLR == 0) {
            (new CalendarUpdater(clockFace, eventsObj)).forceCalendarUpdate();
        }
    });
    Bangle.on('lcdPower', function (on) {
        if (minuteInterval)
            clearInterval(minuteInterval);
        minuteInterval = undefined;
        if (on) {
            minuteInterval = setInterval(function () { clockFace.draw(eventsObj); }, 60 * 1000);
            clockFace.draw(eventsObj); // draw immediately
        }
    });
}
