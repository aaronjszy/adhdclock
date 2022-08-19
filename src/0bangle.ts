class Graphics {}


class Bluetooth {
    static println(msg: string) {}
}

class g {
    static clear() {}
    static reset() {}
    static setFontAlign(x: number, y: number) {}
    static drawString(val: string, x: number, y: number, b: boolean) {}
    static setFont(font: string, size: number) {}
    static getWidth(): any {}
    static getHeight(): any {}
    static drawLine(x1: number, y1: number, x2: number, y2: number) {}
    static getColor(): any {return '';}
    static setColor(hexColor: string) {}
    static drawRect(rect: any) {}
    static fillRect(x1: number, y1: number, x2: number, y2: number) {}
}

class Bangle {
    static drawWidgets() {}
    static on(eventName: string, handler: (...args: any[]) => void) {}
    static setUI(msg: string) {}
    static loadWidgets() {}
    static buzz(duration: number): Promise<any> {
        return new Promise((resolve, reject) => {});
    }
    static setLCDPower(power: number) {}
}
    
class E {
    static showMessage(msg: string): Promise<any> {
        return new Promise((resolve, reject) => {});
    }
    static showPrompt(msg: string, opts: any): Promise<any> {
        return new Promise((resolve, reject) => {});
    }
    static showAlert(msg?: string): Promise<any> {
        return new Promise((resolve, reject) => {});
    }
}

class NRF {
    static getSecurityStatus(): any {}
}