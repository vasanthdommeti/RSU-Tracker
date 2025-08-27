import { useMemo } from 'react';

export type Datum = { x: string; y: number };

export function useBreakdownRows(data: Datum[], isDark: boolean) {
    const total = useMemo(() => data.reduce((a, b) => a + (Number(b.y) || 0), 0), [data]);

    const colors = useMemo(
        () =>
            isDark
                ? ['#93C5FD', '#F9A8D4', '#6EE7B7', '#FBBF24', '#C4B5FD', '#FCA5A5', '#67E8F9']
                : ['#2563EB', '#DB2777', '#059669', '#D97706', '#7C3AED', '#DC2626', '#0891B2'],
        [isDark]
    );

    const rows = useMemo(
        () =>
            data.map((d, i) => {
                const raw = total ? (Number(d.y) / total) * 100 : 0;
                const pct = raw > 0 && raw < 1 ? 1 : Math.round(raw);
                return { key: String(d.x), name: String(d.x), pct, color: colors[i % colors.length], y: d.y };
            }),
        [data, colors, total]
    );

    const twoCol = rows.length > 1;
    return { rows, total, twoCol };
}

// small: light/dark helpers for subtle surfaces
export function useSkins(palette: any) {
    const isLight = palette.background === '#FFFFFF';
    const pillBg = isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.06)';
    const pillBorder = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.10)';
    return { pillBg, pillBorder, isLight };
}

