import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRoute } from '@react-navigation/native';
import { useGrants } from '../../context/GrantsContext';
import { useTheme } from '../../context/ThemeContext';
import { buildVestingEvents, nextVestingEvents } from '../../utils/vesting';
import { estimatedTotalTax, federalWithholding, netProceeds } from '../../utils/calculations';
import { useCompanyLogo, useMoney, useHoldSellHint, useDeleteGrantPrompt } from '../../hooks/useFunctionality';
import { useL10n } from '../../context/LocalizationProvider';

const SPACING = 12;
const WITHHOLD_RATE = 22; // used for label only
const EST_TAX_RATE = 35;  // used for label only

export default function GrantDetailsScreen() {
    // deps
    const route = useRoute<any>();
    const { state, metrics } = useGrants();
    const { palette } = useTheme();
    const { t } = useL10n();

    // styles + helpers
    const s = makeStyles(palette);
    const logoFor = useCompanyLogo();
    const money = useMoney();
    const holdSellHint = useHoldSellHint();
    const confirmDelete = useDeleteGrantPrompt();

    // locate grant
    const grant = state.grants.find(g => g.id === route.params?.id);
    if (!grant) return null;

    // build events
    const events = useMemo(() => buildVestingEvents(grant, state.prices), [grant, state.prices]);
    const next4 = useMemo(() => nextVestingEvents(events, 4), [events]);

    // derive portfolio numbers
    const currentPrice = state.prices[grant.symbol] ?? 0;
    const nowValue = currentPrice * grant.shares;
    const basis = grant.grantPrice * grant.shares;
    const pl = nowValue - basis;
    const plPct = grant.grantPrice > 0 ? ((currentPrice - grant.grantPrice) / grant.grantPrice) * 100 : 0;

    // tax preview
    const simulatedVestedValue = next4.reduce((acc, e) => acc + e.valueAtCurrentPrice, 0);
    const withhold = federalWithholding(simulatedVestedValue);
    const estimated = estimatedTotalTax(simulatedVestedValue);
    const net = netProceeds(simulatedVestedValue);

    // concentration
    const concentration = metrics.byCompany.find(c => c.symbol === grant.symbol)?.value ?? 0;
    const portfolioValue = metrics.totalValue || 1;
    const concentrationPct = (concentration / portfolioValue) * 100;

    // ui state
    const [showDetails, setShowDetails] = useState(false);

    return (
        <ScrollView style={s.screen} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
            {/* Summary card */}
            <View style={s.card}>
                <View style={s.rowTop}>
                    <Image source={logoFor(grant.symbol)} style={s.logo} />
                    <View style={s.nameBlock}>
                        <View style={s.nameRow}>
                            <Text style={s.name} numberOfLines={1}>{grant.company}</Text>
                            <View style={s.tickerPill}><Text style={s.tickerTxt}>{grant.symbol}</Text></View>
                        </View>
                    </View>
                </View>

                <Text style={s.sharesTxt}>{grant.shares} {t('shares')}</Text>

                <View style={s.valueGrid}>
                    {/* avg / now */}
                    <View style={s.leftValues}>
                        <View style={s.kvRow}>
                            <Text style={s.metaLabel}>{t('avg')}</Text>
                            <Text style={s.metaValue}>{money(grant.grantPrice)}</Text>
                        </View>
                        <View style={s.kvRowSpacer}>
                            <Text style={s.metaLabel}>{t('now')}</Text>
                            <Text style={s.metaStrong}>{money(currentPrice)}</Text>
                        </View>
                    </View>

                    {/* value + P/L */}
                    <View style={s.rightValues}>
                        <Text style={s.valueNow} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                            {money(nowValue)}
                        </Text>
                        <Text
                            style={[s.plTiny, pl >= 0 ? s.plUpTxt : s.plDownTxt]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.75}
                        >
                            {pl >= 0 ? '▲' : '▼'} {money(Math.abs(pl))} ({plPct.toFixed(2)}%)
                        </Text>
                    </View>
                </View>

                {/* collapsible details */}
                <TouchableOpacity style={s.detailsHeader} activeOpacity={0.7} onPress={() => setShowDetails(v => !v)}>
                    <Text style={s.detailsTitle}>{t('details')}</Text>
                    <Icon name={showDetails ? 'chevron-up' : 'chevron-down'} size={20} style={s.chevIcon} />
                </TouchableOpacity>

                {showDetails && (
                    <View style={s.detailsBody}>
                        <View style={s.detailRow}>
                            <Text style={s.detailLabel}>{t('basis')}</Text>
                            <Text style={s.detailValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                                {money(basis)}
                            </Text>
                        </View>
                        <View style={s.detailRow}>
                            <Text style={s.detailLabel}>{t('position')}</Text>
                            <Text style={s.detailValue}>{grant.shares} {t('shares')}</Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Upcoming */}
            <View style={s.card}>
                <Text style={s.sectionTitle}>{t('upcomingNext', { n: 4 })}</Text>
                {next4.length === 0 ? (
                    <Text style={s.subtle}>{t('noUpcoming')}</Text>
                ) : (
                    next4.map((e, idx) => (
                        <View key={`${e.date}-${idx}`} style={[s.row, idx < next4.length - 1 ? s.rowDivider : null]}>
                            <Text style={s.rowDate}>{e.date}</Text>
                            <Text style={s.rowMuted}>{e.shares} {t('shares')}</Text>
                            <Text style={s.rowMoney}>{money(e.valueAtCurrentPrice)}</Text>
                        </View>
                    ))
                )}
            </View>

            {/* Tax estimator */}
            <View style={s.card}>
                <Text style={s.sectionTitle}>{t('taxEstimatorTitle', { n: 4 })}</Text>
                <View style={s.kv}>
                    <Text style={s.k}>{t('vestedValue')}</Text><Text style={s.v}>{money(simulatedVestedValue)}</Text>
                </View>
                <View style={s.kv}>
                    <Text style={s.k}>{t('federalWithholdingRate', { rate: WITHHOLD_RATE })}</Text><Text style={s.v}>{money(withhold)}</Text>
                </View>
                <View style={s.kv}>
                    <Text style={s.k}>{t('estimatedTotalTaxRate', { rate: EST_TAX_RATE })}</Text><Text style={s.v}>{money(estimated)}</Text>
                </View>
                <View style={s.netBox}>
                    <Text style={[s.k, s.netLabel]}>{t('netProceeds')}</Text>
                    <Text style={[s.v, s.netValue]}>{money(net)}</Text>
                </View>
            </View>

            {/* Guidance */}
            <View style={s.card}>
                <Text style={s.sectionTitle}>{t('holdVsSell')}</Text>
                <Text style={s.body}>{holdSellHint(concentrationPct)}</Text>
                <Text style={s.subtle}>{t('companyConcentration', { pct: concentrationPct.toFixed(1) })}</Text>
            </View>

            {/* Danger */}
            <TouchableOpacity onPress={() => confirmDelete(grant.id)} style={s.deleteBtn}>
                <Text style={s.deleteText}>{t('deleteGrantCta')}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const makeStyles = (p: any) => {
    const isLight = p.background === '#FFFFFF';
    const pillBg = isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.06)';
    const pillBorder = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.10)';

    return StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: p.background,
        },
        content: {
            padding: SPACING,
            paddingBottom: SPACING * 2,
        },
        card: {
            backgroundColor: p.card,
            borderColor: p.border,
            borderWidth: 1,
            borderRadius: 16,
            padding: SPACING,
            marginBottom: SPACING,
        },
        rowTop: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 6,
        },
        logo: {
            width: 46,
            height: 46,
            borderRadius: 10,
            marginRight: 12,
        },
        nameBlock: {
            flex: 1,
            minWidth: 0,
        },
        nameRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            minWidth: 0,
        },
        name: {
            color: p.text,
            fontSize: 20,
            fontFamily: 'Montserrat-Bold',
            flexShrink: 1,
        },
        tickerPill: {
            minHeight: 22,
            paddingHorizontal: 8,
            borderRadius: 6,
            backgroundColor: pillBg,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: pillBorder,
            alignItems: 'center',
            justifyContent: 'center',
            top: 1,
        },
        tickerTxt: {
            color: p.text,
            fontSize: 12,
            lineHeight: 16,
            includeFontPadding: false,
            textAlignVertical: 'center',
            fontFamily: 'Montserrat-Bold',
        },
        sharesTxt: {
            color: p.muted,
            fontFamily: 'Montserrat-Medium',
            marginBottom: 8,
        },
        valueGrid: {
            flexDirection: 'row',
            alignItems: 'stretch',
            gap: 12,
        },
        leftValues: {
            flex: 1,
            minWidth: 0,
        },
        kvRow: {
            flexDirection: 'row',
            alignItems: 'baseline',
            gap: 8,
        },
        kvRowSpacer: {
            flexDirection: 'row',
            alignItems: 'baseline',
            gap: 8,
            marginTop: 6,
        },
        metaLabel: {
            color: p.muted,
            fontFamily: 'Montserrat-Medium',
        },
        metaValue: {
            color: p.text,
            fontFamily: 'Montserrat-Bold',
        },
        metaStrong: {
            color: p.text,
            fontFamily: 'Montserrat-Bold',
        },
        rightValues: {
            minWidth: 150,
            alignItems: 'flex-end',
            justifyContent: 'center',
        },
        valueNow: {
            color: p.text,
            fontSize: 18,
            fontFamily: 'Montserrat-Bold',
        },
        plTiny: {
            marginTop: 3,
            fontSize: 12,
            fontFamily: 'Montserrat-Medium',
        },
        plUpTxt: {
            color: p.up,
        },
        plDownTxt: {
            color: p.down,
        },
        detailsHeader: {
            marginTop: 12,
            paddingVertical: 8,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderColor: p.border,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        detailsTitle: {
            color: p.text,
            fontFamily: 'Montserrat-Bold',
        },
        chevIcon: {
            color: p.muted,
        },
        detailsBody: {
            marginTop: 6,
            backgroundColor: pillBg,
            borderColor: pillBorder,
            borderWidth: StyleSheet.hairlineWidth,
            borderRadius: 12,
            padding: 10,
            gap: 8,
        },
        detailRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        detailLabel: {
            color: p.muted,
            fontFamily: 'Montserrat-Medium',
        },
        detailValue: {
            color: p.text,
            fontFamily: 'Montserrat-Bold',
        },
        sectionTitle: {
            color: p.text,
            fontSize: 16,
            marginBottom: 8,
            fontFamily: 'Montserrat-Bold',
        },
        subtle: {
            color: p.muted,
            fontFamily: 'Montserrat-Regular',
        },
        body: {
            color: p.text,
            fontFamily: 'Montserrat-Regular',
            marginBottom: 6,
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 10,
        },
        rowDivider: {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: p.border,
        },
        rowDate: {
            flex: 1,
            color: p.text,
            fontFamily: 'Montserrat-Medium',
        },
        rowMuted: {
            width: 120,
            textAlign: 'right',
            color: p.muted,
            fontFamily: 'Montserrat-Regular',
        },
        rowMoney: {
            width: 130,
            textAlign: 'right',
            color: p.text,
            fontFamily: 'Montserrat-Bold',
        },
        kv: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 6,
        },
        k: {
            color: p.text,
            fontFamily: 'Montserrat-Regular',
        },
        v: {
            color: p.text,
            fontFamily: 'Montserrat-Bold',
        },
        netBox: {
            marginTop: 6,
            paddingVertical: 8,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderColor: p.border,
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        netLabel: {
            fontFamily: 'Montserrat-Bold',
            color: p.text,
        },
        netValue: {
            color: p.up,
            fontFamily: 'Montserrat-Bold',
        },
        deleteBtn: {
            borderWidth: 1,
            borderRadius: 14,
            padding: SPACING,
            alignItems: 'center',
            marginTop: 4,
            marginBottom: SPACING * 2,
            borderColor: p.border,
        },
        deleteText: {
            color: p.down,
            fontFamily: 'Montserrat-Bold',
        },
    });
};
