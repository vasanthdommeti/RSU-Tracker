export function sanitizeDecimal(input: string, maxDecimals = 6): string {
    let t = input.replace(/[^\d.]/g, '');
    const firstDot = t.indexOf('.');
    if (firstDot !== -1) {
        t = t.slice(0, firstDot + 1) + t.slice(firstDot + 1).replace(/\./g, '');
    }
    if (firstDot !== -1 && maxDecimals >= 0) {
        const [a, b] = t.split('.');
        t = a + '.' + (b ?? '').slice(0, maxDecimals);
    }
    return t;
}
export function toNumberOrNull(s: string): number | null {
    if (s === '' || s === '.') return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
}
