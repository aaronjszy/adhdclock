class Graphics {}

class Terminal {
    static println(msg: string) {}
}

class Bluetooth {
    static println(msg: string) {}
}

class g {
    static clear() {}
    static clearRect(rect: any) {}
    static reset() {}
    static setFontAlign(x: number, y: number) {}
    static drawString(val: string, x: number, y: number, b: boolean) {}
    static stringWidth(str: string): number {return 0}
    static stringMetrics(str: string): any {return {width: 0, height: 0};}
    static setFont(font: string, size: number) {}
    static getWidth(): any {}
    static getHeight(): any {}
    static drawLine(x1: number, y1: number, x2: number, y2: number) {}
    static drawLineAA(x1: number, y1: number, x2: number, y2: number) {}
    static getColor(): any {return '';}
    static setColor(hexColor: string) {}
    static drawRect(rect: any) {}
    static fillRect(x1: number, y1: number, x2: number, y2: number) {}
    static fillPoly(points: number[]) {}
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
    static http(url: string): Promise<any> {
        return new Promise((resolve, reject) => {});
    }
};
    
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
