export function zeroPad(n: number) : string {
    return ("0" + n.toString(10)).substr(-2, 1000);
}
