import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

type Mode = 'system' | 'light' | 'dark';

export type Palette = {
    background: string;
    card: string;
    text: string;
    muted: string;
    up: string;
    down: string;
    border: string;
};

const light: Palette = {
    background: '#FFFFFF',
    card: '#F7F8FA',
    text: '#0F172A',
    muted: '#64748B',
    up: '#16a34a',
    down: '#dc2626',
    border: '#E2E8F0',
};
const dark: Palette = {
    background: '#0B1220',
    card: '#0F1628',
    text: '#E5E7EB',
    muted: '#94A3B8',
    up: '#22c55e',
    down: '#ef4444',
    border: '#1F2937',
};

type ThemeValue = {
    palette: Palette;
    mode: Mode;               // user preference
    setMode: (m: Mode) => void;
    isDark: boolean;          // resolved effective scheme
};

const ThemeCtx = createContext<ThemeValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<Mode>('system');       // user preference
    const systemScheme = useColorScheme();                   // 'light' | 'dark' | null

    // Resolve effective scheme
    const effective = mode === 'system' ? (systemScheme ?? 'light') : mode;  // 'light' | 'dark'
    const isDark = effective === 'dark';

    const palette = useMemo(() => (isDark ? dark : light), [isDark]);

    const value = useMemo(
        () => ({ palette, mode, setMode, isDark }),
        [palette, mode, isDark]
    );

    return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
};

export function useTheme() {
    const ctx = useContext(ThemeCtx);
    if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
    return ctx;
}
