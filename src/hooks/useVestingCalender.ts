import { useMemo } from "react";
import { VestEvent } from "../types/types";
import { format, parseISO } from 'date-fns';

export function useVestingSections(events: VestEvent[]) {
    return useMemo(() => {
        const map = new Map<string, VestEvent[]>();
        for (const e of events) {
            const key = format(parseISO(e.date), 'yyyy MMM');
            const arr = map.get(key) ?? [];
            arr.push(e);
            map.set(key, arr);
        }
        return Array.from(map.entries()).map(([title, data]) => {
            const total = data.reduce((sum, ev) => sum + ev.valueAtCurrentPrice, 0);
            return { title, data, total };
        });
    }, [events]);
}

// palette-aware pills and cards
export function useSkins(palette: any) {
    const isLight = palette.background === '#FFFFFF';
    const pillBg = isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.06)';
    const pillBorder = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.10)';
    return { pillBg, pillBorder };
}
