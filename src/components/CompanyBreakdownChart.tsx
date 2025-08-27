import React, { useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import * as Victory from 'victory-native';
import { useTheme } from '../context/ThemeContext';
import { useBreakdownRows, Datum, useSkins } from '../hooks/useBreakdownChart';

type Props = { data: Datum[]; fontFamily?: string };

export default function CompanyBreakdownChart({ data, fontFamily }: Props) {
    const V: any = Victory as any;
    const VictoryPie = V.VictoryPie;
    const { palette, isDark } = useTheme();
    const { pillBg, pillBorder } = useSkins(palette);

    const [width, setWidth] = useState(0);
    const onLayout = (e: LayoutChangeEvent) => setWidth(Math.round(e.nativeEvent.layout.width));

    const { rows, twoCol } = useBreakdownRows(data, isDark);

    return (
        <View style={styles.wrap}>
            <View style={styles.square} onLayout={onLayout}>
                {width > 0 && VictoryPie && (
                    <VictoryPie
                        width={width}
                        height={width}
                        data={rows.map((r) => ({ x: r.name, y: Number(r.y) }))}
                        colorScale={rows.map((r) => r.color)}
                        innerRadius={({ radius }: any) => Math.round(radius * 0.62)}
                        labels={() => ''}
                        padAngle={1.2}
                        cornerRadius={6}
                        animate={{ duration: 600, easing: 'quadInOut' }}
                    />
                )}
            </View>

            <View style={styles.legend}>
                {rows.map((r) => (
                    <View
                        key={r.key}
                        style={[
                            styles.legendItemBase,
                            twoCol ? styles.legendItemHalf : styles.legendItemFull,
                            { backgroundColor: pillBg, borderColor: pillBorder }
                        ]}
                    >
                        <View style={styles.legendLeft}>
                            <View style={[styles.swatch, { backgroundColor: r.color }]} />
                            <Text style={[styles.legendName, { color: palette.text, fontFamily }]} numberOfLines={1}>
                                {r.name}
                            </Text>
                        </View>
                        <Text style={[styles.legendPct, { color: palette.muted, fontFamily }]}>{isFinite(r.pct) ? `${r.pct}%` : '—'}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        width: '100%'
    },
    square: {
        width: '100%',
        height: 300,
        alignItems: 'center',
        justifyContent: 'center'
    },
    legend: {
        paddingHorizontal: 8,
        paddingBottom: 8,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 10
    },
    legendItemBase: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: StyleSheet.hairlineWidth
    },
    legendItemHalf: {
        flexBasis: '48%'
    },
    legendItemFull: {
        flexBasis: '100%'
    },
    legendLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 1
    },
    swatch: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8
    },
    legendName: {
        fontSize: 13,
        fontFamily: 'Montserrat-Bold',
        letterSpacing: 0.2,
        maxWidth: '85%'
    },
    legendPct: {
        fontSize: 12,
        fontFamily: 'Montserrat-Medium',
        marginLeft: 8
    }
});
