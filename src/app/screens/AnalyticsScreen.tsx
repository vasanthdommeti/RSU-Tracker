import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Victory from 'victory-native';
import { Defs, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

type Point = { x: Date; y: number };
type Series = { past: Point[]; future: Point[] };

const V: any = Victory as any;
const VictoryChart = V.VictoryChart;
const VictoryAxis = V.VictoryAxis;
const VictoryLine = V.VictoryLine;
const VictoryArea = V.VictoryArea;
const VictoryGroup = V.VictoryGroup;
const VictoryLegend = V.VictoryLegend;
const VictoryClipContainer = V.VictoryClipContainer;

const SCREEN_W = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_W - 24;                  // card horizontal margins (12 + 12)
const SPARK_WIDTH = SCREEN_W - (12 + 12 + 70 + 12 + 12); // outer paddings + label + inner paddings

const SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA'] as const;
type SymbolKey = typeof SYMBOLS[number];

const COLORS: Record<SymbolKey, string> = {
    AAPL: '#2563EB',
    MSFT: '#10B981',
    GOOGL: '#F59E0B',
    META: '#DB2777',
    NVDA: '#7C3AED',
};

/** Random-ish series with slight up drift; future = more optimistic drift */
function genSeries(startPrice: number, daysPast = 120, daysFuture = 30): Series {
    const r = (min: number, max: number) => min + Math.random() * (max - min);
    const today = new Date();

    const past: Point[] = [];
    let p = startPrice;
    for (let i = daysPast - 1; i >= 0; i--) {
        const d = new Date(today); d.setDate(today.getDate() - i);
        p = Math.max(1, p * (1 + r(-0.01, 0.012)));
        past.push({ x: d, y: Number(p.toFixed(2)) });
    }

    const future: Point[] = [];
    let f = past[past.length - 1].y;
    for (let i = 1; i <= daysFuture; i++) {
        const d = new Date(today); d.setDate(today.getDate() + i);
        f = Math.max(1, f * (1 + r(0.001, 0.012)));
        future.push({ x: d, y: Number(f.toFixed(2)) });
    }
    return { past, future };
}

export default function StockForecastScreen() {
    const { palette, isDark } = useTheme();

    const [selected, setSelected] = useState<SymbolKey>('META');
    const [range, setRange] = useState<'3M' | '6M' | '1Y'>('3M');

    const pastDays = range === '3M' ? 90 : range === '6M' ? 180 : 365;

    const series = useMemo(() => {
        const bases: Record<SymbolKey, number> = {
            AAPL: 170, MSFT: 415, GOOGL: 155, META: 505, NVDA: 980,
        };
        return genSeries(bases[selected], pastDays, 45);
    }, [selected, pastDays]);

    const accent = COLORS[selected];
    const s = makeStyles(palette, isDark, accent);

    const lastPast = series.past[series.past.length - 1]?.y ?? 1;
    const lastFuture = series.future[series.future.length - 1]?.y ?? lastPast;
    const projPct = ((lastFuture - lastPast) / lastPast) * 100;

    // outer list data (mini sparklines)
    const data = SYMBOLS as SymbolKey[];

    return (
        <SafeAreaView style={s.safe} edges={['top']}>
            <FlatList
                showsVerticalScrollIndicator={false}
                data={data}
                keyExtractor={(k) => 'mini-' + k}
                contentContainerStyle={s.listContent}
                ItemSeparatorComponent={() => <View style={s.separator} />}
                ListFooterComponent={<View style={s.footer} />}
                ListHeaderComponent={
                    <HeaderSection
                        range={range}
                        onChangeRange={setRange}
                        selected={selected}
                        onPick={setSelected}
                        palette={palette}
                        isDark={isDark}
                        accent={accent}
                        projPct={projPct}
                        series={series}
                    />
                }
                renderItem={({ item }) => (
                    <MiniRow
                        symbol={item}
                        accent={COLORS[item]}
                        palette={palette}
                    />
                )}
            />
        </SafeAreaView>
    );
}


function HeaderSection({
    range, onChangeRange, selected, onPick, palette, isDark, accent, projPct, series,
}: {
    range: '3M' | '6M' | '1Y';
    onChangeRange: (r: '3M' | '6M' | '1Y') => void;
    selected: SymbolKey;
    onPick: (s: SymbolKey) => void;
    palette: any;
    isDark: boolean;
    accent: string;
    projPct: number;
    series: Series;
}) {
    const s = makeStyles(palette, isDark, accent);

    // Victory styles as named constants (not inline literals)
    const axisBase = {
        axis: { stroke: palette.border },
        tickLabels: { fill: palette.muted, fontFamily: 'Montserrat-Medium', fontSize: 10 },
        grid: { stroke: 'transparent' },
    };
    const depAxis = {
        axis: { stroke: palette.border },
        tickLabels: { fill: palette.muted, fontFamily: 'Montserrat-Medium', fontSize: 10 },
        grid: { stroke: palette.border, strokeOpacity: 0.25 },
    };
    const histArea = { data: { fill: 'url(#fillPast)', strokeWidth: 0 } };
    const histLine = { data: { stroke: accent, strokeWidth: 2 } };
    const futArea = { data: { fill: 'url(#fillFuture)', strokeWidth: 0 } };
    const futLine = { data: { stroke: accent, strokeWidth: 2, strokeDasharray: '6,6', opacity: 0.9 } };
    const legendLabels = { labels: { fill: palette.muted, fontFamily: 'Montserrat-Medium', fontSize: 11 } };

    return (
        <View>
            <View style={s.header}>
                <Text style={s.h1}>Stocks & Forecast</Text>
                <View style={s.rangeRow}>
                    {(['3M', '6M', '1Y'] as const).map(r => (
                        <TouchableOpacity
                            key={r}
                            onPress={() => onChangeRange(r)}
                            style={[s.chip, r === range && s.chipActive]}
                            activeOpacity={0.9}
                        >
                            <Text style={[s.chipTxt, r === range && s.chipTxtActive]}>{r}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* ticker selector */}
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.tickerListContent}
                ItemSeparatorComponent={() => <View style={s.tickerSep} />}
                data={SYMBOLS as SymbolKey[]}
                keyExtractor={(k) => k}
                renderItem={({ item }) => (
                    <TickerPill
                        symbol={item}
                        active={item === selected}
                        onPress={() => onPick(item)}
                        color={COLORS[item]}
                        palette={palette}
                        isDark={isDark}
                    />
                )}
            />

            {/* big chart card */}
            <View style={s.card}>
                <View style={s.cardHeader}>
                    <View style={s.cardHeaderLeft}>
                        <Text style={s.symbolTxt}>{selected}</Text>
                        <Text style={s.subtitle}>Projection next 45 days</Text>
                    </View>
                    <View style={s.badge}>
                        <Ionicons
                            name={projPct >= 0 ? 'trending-up' : 'trending-down'}
                            size={14}
                            color={projPct >= 0 ? palette.up : palette.down}
                        />
                        <Text style={[s.badgeTxt, projPct >= 0 ? s.badgeUp : s.badgeDown]}>
                            {projPct >= 0 ? '+' : ''}{projPct.toFixed(1)}%
                        </Text>
                    </View>
                </View>

                <View style={s.chartBox}>
                    <VictoryChart
                        height={280}
                        width={CHART_WIDTH}
                        padding={{ left: 48, right: 24, top: 24, bottom: 40 }}
                        scale={{ x: 'time' }}
                        domainPadding={{ y: 16 }}
                    >
                        <Defs>
                            <LinearGradient id="fillPast" x1="0" y1="0" x2="0" y2="1">
                                <Stop offset="0%" stopColor={accent} stopOpacity={isDark ? 0.35 : 0.25} />
                                <Stop offset="100%" stopColor={accent} stopOpacity={0.02} />
                            </LinearGradient>
                            <LinearGradient id="fillFuture" x1="0" y1="0" x2="0" y2="1">
                                <Stop offset="0%" stopColor={accent} stopOpacity={0.24} />
                                <Stop offset="100%" stopColor={accent} stopOpacity={0.01} />
                            </LinearGradient>
                        </Defs>

                        <VictoryAxis style={axisBase as any} tickCount={5} tickFormat={(t: Date) => (
                            `${t.toLocaleString(undefined, { month: 'short' })} ${t.getDate()}`
                        )} />
                        <VictoryAxis dependentAxis style={depAxis as any} />

                        <VictoryGroup
                            data={series.past}
                            groupComponent={<VictoryClipContainer clipPadding={{ top: 0, left: 0, right: 0, bottom: 0 }} />}
                        >
                            <VictoryArea style={histArea as any} interpolation="monotoneX" />
                            <VictoryLine style={histLine as any} interpolation="monotoneX" />
                        </VictoryGroup>

                        <VictoryGroup
                            data={series.future}
                            groupComponent={<VictoryClipContainer clipPadding={{ top: 0, left: 0, right: 0, bottom: 0 }} />}
                        >
                            <VictoryArea style={futArea as any} interpolation="monotoneX" />
                            <VictoryLine style={futLine as any} interpolation="monotoneX" />
                        </VictoryGroup>

                        <VictoryLegend
                            x={12}
                            y={6}
                            gutter={18}
                            orientation="horizontal"
                            itemsPerRow={3}
                            data={[
                                { name: 'History', symbol: { fill: accent } },
                                { name: 'Projection', symbol: { fill: accent, strokeDasharray: '6,6' } },
                            ]}
                            style={legendLabels as any}
                        />
                    </VictoryChart>
                </View>
            </View>
        </View>
    );
}

function TickerPill({
    symbol, active, onPress, color, palette, isDark,
}: {
    symbol: SymbolKey;
    active: boolean;
    onPress: () => void;
    color: string;
    palette: any;
    isDark: boolean;
}) {
    const s = makeStyles(palette, isDark, '#000'); // accent not used here

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[s.ticker, active ? s.tickerActive : s.tickerInactive]}
            activeOpacity={0.9}
        >
            <View style={[s.swatch, { backgroundColor: color }]} />
            <Text style={s.tickerText} numberOfLines={1}>{symbol}</Text>
        </TouchableOpacity>
    );
}

function MiniRow({
    symbol, accent, palette,
}: {
    symbol: SymbolKey;
    accent: string;
    palette: any;
}) {
    const s = makeStyles(palette, false, accent);
    const data = useMemo(() => {
        const base = { AAPL: 165, MSFT: 410, GOOGL: 150, META: 500, NVDA: 970 }[symbol as SymbolKey];
        return genSeries(base, 45, 0).past;
    }, [symbol]);

    return (
        <View style={s.miniCard}>
            <Text style={s.miniSymbol}>{symbol}</Text>
            <View style={s.sparkWrap}>
                <VictoryChart
                    height={48}
                    width={SPARK_WIDTH}
                    padding={{ left: 0, right: 0, top: 8, bottom: 8 }}
                    scale={{ x: 'time' }}
                    domainPadding={{ y: 4 }}
                >
                    <VictoryLine
                        data={data}
                        interpolation="monotoneX"
                        style={{ data: { stroke: accent, strokeWidth: 2 } }}
                        groupComponent={<VictoryClipContainer clipPadding={{ left: 0, right: 0 }} />}
                    />
                </VictoryChart>
            </View>
        </View>
    );
}

const makeStyles = (p: any, isDark: boolean, accent: string) =>
    StyleSheet.create({
        safe: { flex: 1, backgroundColor: p.background },
        listContent: { paddingBottom: 24 },
        separator: { height: 10 },
        footer: { height: 8 },
        header: { paddingHorizontal: 12, paddingTop: 6, paddingBottom: 8 },
        h1: { color: p.text, fontSize: 22, fontFamily: 'Montserrat-Bold' },
        rangeRow: { flexDirection: 'row', marginTop: 8 },
        chip: {
            height: 36,
            paddingHorizontal: 12,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: p.border,
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)',
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8,
        },
        chipActive: { backgroundColor: `${accent}${isDark ? '26' : '1A'}`, borderColor: accent },
        chipTxt: { color: p.muted, fontFamily: 'Montserrat-Medium' },
        chipTxtActive: { color: p.text, fontFamily: 'Montserrat-Bold' },
        tickerListContent: { paddingHorizontal: 12, paddingRight: 6 },
        tickerSep: { width: 8 },
        ticker: {
            minWidth: 72,
            height: 36,
            paddingHorizontal: 14,
            borderRadius: 999,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: p.border,
            flexDirection: 'row',
            alignItems: 'center',
        },
        tickerActive: { backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.06)' },
        tickerInactive: { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)' },
        swatch: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
        tickerText: { color: p.text, fontFamily: 'Montserrat-Bold' },
        card: {
            backgroundColor: p.card,
            borderColor: p.border,
            borderWidth: 1,
            borderRadius: 16,
            marginHorizontal: 12,
            marginTop: 12,
            marginBottom: 12,
            padding: 12,
        },
        cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
        cardHeaderLeft: { flex: 1 },
        symbolTxt: { color: p.text, fontFamily: 'Montserrat-Bold', fontSize: 18 },
        subtitle: { color: p.muted, fontFamily: 'Montserrat-Medium', marginTop: 2 },
        badge: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)',
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: p.border,
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 4,
        },
        badgeTxt: { marginLeft: 6, fontFamily: 'Montserrat-Bold' },
        badgeUp: { color: p.up },
        badgeDown: { color: p.down },
        chartBox: {
            borderRadius: 12,
            overflow: 'hidden', // keep chart inside rounded card
            backgroundColor: p.card,
        },
        miniCard: {
            marginHorizontal: 12,
            backgroundColor: p.card,
            borderWidth: 1, borderColor: p.border,
            borderRadius: 16, padding: 12,
            flexDirection: 'row', alignItems: 'center',
        },
        miniSymbol: { color: p.text, fontFamily: 'Montserrat-Bold', width: 70 },
        sparkWrap: { flex: 1, height: 48, borderRadius: 10, overflow: 'hidden', width: SPARK_WIDTH },
    });
