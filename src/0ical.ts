
class RawComponent {
    name: string;
    properties: string[];
    components: RawComponent[];

    constructor() {
        this.name = "";
        this.properties = [];
        this.components = [];
    }
}

class TimezoneComponent {
    component: RawComponent;
    constructor(component: RawComponent) {
        this.component = component;
    }
}

class EventComponent {
    component: RawComponent;
    constructor(component: any) {
        this.component = component;
    }
}

class UnsupportedComponent {
    component: RawComponent;
    constructor(component: RawComponent) {
        this.component = component;
    }
}

class Calendar {
    events: EventComponent[];
    timezones: TimezoneComponent[];
    unsupported: UnsupportedComponent[];
    constructor(events: EventComponent[], timezones: TimezoneComponent[], unsupported: UnsupportedComponent[]) {
        this.events = events;
        this.timezones = timezones;
        this.unsupported = unsupported;
    }
}

function parseComponent(lines: string[], i: number): any {
    var rawComponent = new RawComponent();
    rawComponent.name = lines[i].substring(6);
    rawComponent.properties = [];
    rawComponent.components = [];
    i++;
    while (lines[i].indexOf('END:' + rawComponent.name) !== 0) {
        if (lines[i].indexOf('BEGIN:') === 0) {
            rawComponent.components.push(parseComponent(lines, i));
        } else {
            rawComponent.properties.push(lines[i]);
        }
        i++;
    }
    
    var component = {};
    if (rawComponent.name === 'VEVENT') {
        component = new EventComponent(rawComponent);
    } else if (rawComponent.name === 'VTIMEZONE') {
        component = new TimezoneComponent(rawComponent);
    } else {
        component = new UnsupportedComponent(rawComponent);
    }

    return component;
}

function parseICal(data: string): Calendar {
    var lines = data.split('\r\n');

    var events: EventComponent[] = [];
    var timezones: TimezoneComponent[] = [];
    var unsupported: UnsupportedComponent[] = [];

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.indexOf('BEGIN:') === 0) {
            var component = parseComponent(lines, i);
            if (component.name === 'VEVENT') {
                events.push(component);
            } else if (component.name === 'VTIMEZONE') {
                timezones.push(component);
            } else {
                unsupported.push(component);
            }
        }
    }
    
    return new Calendar(events, timezones, unsupported);
}
