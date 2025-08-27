import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, SectionList, Image } from 'react-native';
import { format, parseISO, compareAsc } from 'date-fns';
import { useGrants } from '../../context/GrantsContext';
import { useTheme } from '../../context/ThemeContext';
import { useL10n } from '../../context/LocalizationProvider';
import { buildVestingEvents } from '../../utils/vesting';
import { useSafeTop } from '../../hooks/useSafeInsets';
import { useCompanyLogo, useMoney } from '../../hooks/useFunctionality';
import { VestEvent } from '../../types/types';
import { useSkins, useVestingSections } from '../../hooks/useVestingCalender';

export default function VestingCalendarScreen() {
    // theme + l10n + safe area + assets
    const { palette } = useTheme();
    const { t } = useL10n();
    const top = useSafeTop();
    const logoFor = useCompanyLogo();
    const { pillBg, pillBorder } = useSkins(palette);
    const s = makeStyles(palette, top, pillBg, pillBorder);
    const money = useMoney();

    // build, sort, group events
    const { state } = useGrants();
    const sortedEvents = useMemo(() => {
        const evts: VestEvent[] = state.grants.flatMap((g) =>
            buildVestingEvents(g, state.prices)
        );
        evts.sort((a, b) => compareAsc(parseISO(a.date), parseISO(b.date)));
        return evts;
    }, [state.grants, state.prices]);

    // month sections with totals
    const sections = useVestingSections(sortedEvents);

    // memoized renderers (no inline styles inside JSX)
    const keyExtractor = useCallback(
        (item: VestEvent, idx: number) => `${item.symbol}-${item.date}-${idx}`,
        []
    );

    const renderSectionHeader = useCallback(
        ({ section }: { section: { title: string; total: number } }) => (
            <View style={s.headerWrap}>
                <View style={s.headerCard}>
                    <Text style={s.headerTitle}>{section.title}</Text>
                    <Text style={s.headerTotal}>{money(section.total)}</Text>
                </View>
            </View>
        ),
        [s, money]
    );

    const renderItem = useCallback(
        ({ item }: { item: VestEvent }) => {
            const d = parseISO(item.date);
            const day = format(d, 'd');
            const dow = format(d, 'EEE');
            return (
                <View style={s.rowCard}>
                    <View style={s.dateBadge}>
                        <Text style={s.day}>{day}</Text>
                        <Text style={s.dow}>{dow}</Text>
                    </View>

                    <View style={s.mid}>
                        <View style={s.symbolRow}>
                            <Image source={logoFor(item.symbol)} style={s.logo} />
                            <View style={s.symbolPill}>
                                <Text style={s.symbolTxt}>{item.symbol}</Text>
                            </View>
                        </View>
                        <Text style={s.shares} numberOfLines={1}>
                            {item.shares} {t('shares')}
                        </Text>
                    </View>

                    <View style={s.right}>
                        <Text style={s.money} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                            {money(item.valueAtCurrentPrice)}
                        </Text>
                    </View>
                </View>
            );
        },
        [logoFor, s, t, money]
    );

    const ItemSeparator = useCallback(() => <View style={s.itemSep} />, [s]);
    const SectionSeparator = useCallback(() => <View style={s.sectionSep} />, [s]);

    return (
        <View style={s.screen}>
            <SectionList
                sections={sections}
                keyExtractor={keyExtractor}
                renderSectionHeader={renderSectionHeader}
                renderItem={renderItem}
                ItemSeparatorComponent={ItemSeparator}
                SectionSeparatorComponent={SectionSeparator}
                contentContainerStyle={s.listContent}
                showsVerticalScrollIndicator={false}
                stickySectionHeadersEnabled
            />
        </View>
    );
}

const makeStyles = (p: any, top: number, pillBg: string, pillBorder: string) =>
    StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: p.background,
            paddingTop: top,
        },
        listContent: {
            paddingHorizontal: 12,
            paddingBottom: 12,
        },
        headerWrap: {
            paddingTop: 8,
            paddingBottom: 6,
            backgroundColor: p.background,
        },
        headerCard: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderWidth: StyleSheet.hairlineWidth,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: pillBg,
            borderColor: pillBorder,
        },
        headerTitle: {
            fontSize: 16,
            fontFamily: 'Montserrat-Bold',
            color: p.text,
        },
        headerTotal: {
            fontSize: 12,
            fontFamily: 'Montserrat-Medium',
            color: p.muted,
        },
        rowCard: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderRadius: 14,
            padding: 12,
            backgroundColor: p.card,
            borderColor: p.border,
        },
        dateBadge: {
            width: 56,
            height: 56,
            borderRadius: 12,
            borderWidth: StyleSheet.hairlineWidth,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            backgroundColor: pillBg,
            borderColor: pillBorder,
        },
        day: {
            fontSize: 18,
            lineHeight: 22,
            fontFamily: 'Montserrat-Bold',
            color: p.text,
        },
        dow: {
            fontSize: 11,
            lineHeight: 13,
            fontFamily: 'Montserrat-Medium',
            color: p.muted,
        },
        mid: {
            flex: 1,
            minWidth: 0,
        },
        symbolRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        logo: {
            width: 20,
            height: 20,
            borderRadius: 4,
        },
        symbolPill: {
            borderWidth: StyleSheet.hairlineWidth,
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 2,
            backgroundColor: pillBg,
            borderColor: pillBorder,
        },
        symbolTxt: {
            fontSize: 12,
            fontFamily: 'Montserrat-Bold',
            color: p.text,
        },
        shares: {
            marginTop: 4,
            fontSize: 12,
            fontFamily: 'Montserrat-Medium',
            color: p.muted,
        },
        right: {
            marginLeft: 8,
            maxWidth: 140,
            alignItems: 'flex-end',
        },
        money: {
            fontSize: 14,
            fontFamily: 'Montserrat-Bold',
            color: p.text,
        },
        itemSep: {
            height: 8,
        },
        sectionSep: {
            height: 12,
        },
    });
