declare function setWatch(func: ((arg: { state: boolean, time: number, lastTime: number }) => void) | string, pin: Pin, options?: boolean | { repeat?: boolean, edge?: "rising" | "falling" | "both", debounce?: number, irq?: boolean, data?: Pin, hispeed?: boolean }): number;

declare class Pin {
    /**
     * Creates a pin from the given argument (or returns undefined if no argument)
     * @constructor
     *
     * @param {any} value - A value to be converted to a pin. Can be a number, pin, or String.
     * @returns {any} A Pin object
     * @url http://www.espruino.com/Reference#l_Pin_Pin
     */
    static new(value: any): any;
  
    /**
     * Returns the input state of the pin as a boolean.
     *  **Note:** if you didn't call `pinMode` beforehand then this function will also
     *  reset the pin's state to `"input"`
     * @returns {boolean} Whether pin is a logical 1 or 0
     * @url http://www.espruino.com/Reference#l_Pin_read
     */
    read(): boolean;
  
    /**
     * Sets the output state of the pin to a 1
     *  **Note:** if you didn't call `pinMode` beforehand then this function will also
     *  reset the pin's state to `"output"`
     * @url http://www.espruino.com/Reference#l_Pin_set
     */
    set(): void;
  
    /**
     * Sets the output state of the pin to a 0
     *  **Note:** if you didn't call `pinMode` beforehand then this function will also
     *  reset the pin's state to `"output"`
     * @url http://www.espruino.com/Reference#l_Pin_reset
     */
    reset(): void;
  
    /**
     * Sets the output state of the pin to the parameter given
     *  **Note:** if you didn't call `pinMode` beforehand then this function will also
     *  reset the pin's state to `"output"`
     *
     * @param {boolean} value - Whether to set output high (true/1) or low (false/0)
     * @url http://www.espruino.com/Reference#l_Pin_write
     */
    write(value: boolean): void;
  
    /**
     * Sets the output state of the pin to the parameter given at the specified time.
     *  **Note:** this **doesn't** change the mode of the pin to an output. To do that,
     *  you need to use `pin.write(0)` or `pinMode(pin, 'output')` first.
     *
     * @param {boolean} value - Whether to set output high (true/1) or low (false/0)
     * @param {number} time - Time at which to write
     * @url http://www.espruino.com/Reference#l_Pin_writeAtTime
     */
    writeAtTime(value: boolean, time: number): void;
  
    /**
     * Return the current mode of the given pin. See `pinMode` for more information.
     * @returns {any} The pin mode, as a string
     * @url http://www.espruino.com/Reference#l_Pin_getMode
     */
    getMode(): any;
  
    /**
     * Set the mode of the given pin. See [`pinMode`](#l__global_pinMode) for more
     * information on pin modes.
     *
     * @param {any} mode - The mode - a string that is either 'analog', 'input', 'input_pullup', 'input_pulldown', 'output', 'opendrain', 'af_output' or 'af_opendrain'. Do not include this argument if you want to revert to automatic pin mode setting.
     * @url http://www.espruino.com/Reference#l_Pin_mode
     */
    mode(mode: any): void;
  
    /**
     * Toggles the state of the pin from off to on, or from on to off.
     * **Note:** This method doesn't currently work on the ESP8266 port of Espruino.
     * **Note:** if you didn't call `pinMode` beforehand then this function will also
     * reset the pin's state to `"output"`
     * @returns {boolean} True if the pin is high after calling the function
     * @url http://www.espruino.com/Reference#l_Pin_toggle
     */
    toggle(): boolean;
  
    /**
     * Get information about this pin and its capabilities. Of the form:
     * ```
     * {
     *   "port"      : "A", // the Pin's port on the chip
     *   "num"       : 12, // the Pin's number
     *   "in_addr"   : 0x..., // (if available) the address of the pin's input address in bit-banded memory (can be used with peek)
     *   "out_addr"  : 0x..., // (if available) the address of the pin's output address in bit-banded memory (can be used with poke)
     *   "analog"    : { ADCs : [1], channel : 12 }, // If analog input is available
     *   "functions" : {
     *     "TIM1":{type:"CH1, af:0},
     *     "I2C3":{type:"SCL", af:1}
     *   }
     * }
     * ```
     * Will return undefined if pin is not valid.
     * @returns {any} An object containing information about this pins
     * @url http://www.espruino.com/Reference#l_Pin_getInfo
     */
    getInfo(): any;
  }

declare const BTN1: Pin;
declare const BTN2: Pin;
declare const BTN3: Pin;
declare const BTN4: Pin;
declare const BTN5: Pin;

declare var GB: any;

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
    static showLauncher() {}
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

