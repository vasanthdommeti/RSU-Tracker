import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, findNodeHandle, TextInput, UIManager, View } from 'react-native';

export type CompanyItem = { label: string; value: string; name: string };

export function useTypeahead(
    items: CompanyItem[],
    resetKey = 0,
    onSelect?: (item: CompanyItem | null) => void
) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const inputRef = useRef<TextInput>(null);
    const hostRef = useRef<View>(null);
    const [anchor, setAnchor] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

    useEffect(() => {
        setQuery('');
        setOpen(false);
    }, [resetKey]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;
        return items.filter((it) => it.label.toLowerCase().includes(q));
    }, [query, items]);

    const pick = useCallback(
        (it: CompanyItem) => {
            setQuery(it.label);
            setOpen(false);
            onSelect?.(it);
        },
        [onSelect]
    );

    const clear = useCallback(() => {
        setQuery('');
        setOpen(true);
        onSelect?.(null);
        setTimeout(() => inputRef.current?.focus(), 0);
    }, [onSelect]);

    const measure = useCallback(() => {
        const node = findNodeHandle(hostRef.current);
        if (!node) return;

        UIManager.measureInWindow(node, (x, y, w, h) => {
            const margin = 8;
            const screenW = Dimensions.get('window').width;
            const width = Math.min(w, screenW - margin * 2);
            const left = Math.min(Math.max(x, margin), screenW - width - margin);
            setAnchor({ x: left, y, w: width, h });
        });
    }, []);

    return { open, setOpen, query, setQuery, inputRef, hostRef, anchor, filtered, pick, clear, measure };
}
