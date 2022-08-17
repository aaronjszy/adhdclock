var Graphics = /** @class */ (function () {
    function Graphics() {
    }
    return Graphics;
}());
var Bluetooth = /** @class */ (function () {
    function Bluetooth() {
    }
    Bluetooth.println = function (msg) { };
    return Bluetooth;
}());
var g = /** @class */ (function () {
    function g() {
    }
    g.clear = function () { };
    g.reset = function () { };
    g.setFontAlign = function (x, y) { };
    g.drawString = function (val, x, y, b) { };
    g.setFont = function (font, size) { };
    g.getWidth = function () { };
    g.getHeight = function () { };
    g.drawLine = function (x1, y1, x2, y2) { };
    g.getColor = function () { return ''; };
    g.setColor = function (hexColor) { };
    g.drawRect = function (rect) { };
    g.fillRect = function (x1, y1, x2, y2) { };
    return g;
}());
var Bangle = /** @class */ (function () {
    function Bangle() {
    }
    Bangle.drawWidgets = function () { };
    Bangle.on = function (eventName, handler) { };
    Bangle.setUI = function (msg) { };
    Bangle.loadWidgets = function () { };
    Bangle.buzz = function (duration) {
        return new Promise(function (resolve, reject) { });
    };
    Bangle.setLCDPower = function (power) { };
    return Bangle;
}());
var E = /** @class */ (function () {
    function E() {
    }
    E.showMessage = function (msg) {
        return new Promise(function (resolve, reject) { });
    };
    E.showPrompt = function (msg, opts) {
        return new Promise(function (resolve, reject) { });
    };
    E.showAlert = function (msg) {
        return new Promise(function (resolve, reject) { });
    };
    return E;
}());
var NRF = /** @class */ (function () {
    function NRF() {
    }
    NRF.getSecurityStatus = function () { };
    return NRF;
}());
