
export function fillLine(x1: number, y1:  number, x2:  number, y2:  number, lineWidth:  number) {
    var dx, dy, d;
        lineWidth = (lineWidth - 1) / 2;
        dx = x2 - x1;
        dy = y2 - y1;
        d = Math.sqrt(dx * dx + dy * dy);
        dx = Math.round(dx * lineWidth / d);
        dy = Math.round(dy * lineWidth / d);
        g.fillPoly([x1 + dx, y1 - dy, x1 - dx, y1 + dy, x2 - dx, y2 + dy, x2 + dx, y2 - dy]);
}
