import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGrants } from '../../context/GrantsContext';
import { useTheme } from '../../context/ThemeContext';
import { useL10n } from '../../context/LocalizationProvider';
import CompanyBreakdownChart from '../../components/CompanyBreakdownChart';
import GrantCard from '../../components/GrantCard';

const SPACING = 12;

export default function PortfolioOverviewScreen() {
    // theme + i18n
    const { palette } = useTheme();
    const { t } = useL10n();
    const styles = makeStyles(palette);

    // data + nav
    const { state, metrics, refreshPrices } = useGrants();
    const nav = useNavigation<any>();

    // fetch prices once if empty
    useEffect(() => {
        if (!Object.keys(state.prices).length) refreshPrices();
    }, []);

    // pie chart %
    const pct = useMemo(
        () =>
            metrics.totalValue
                ? metrics.byCompany.map(c => ({ x: c.symbol, y: (c.value / metrics.totalValue) * 100 }))
                : [],
        [metrics.totalValue, metrics.byCompany]
    );

    // header (cards + “Grants” label)
    const Header = () => (
        <View style={styles.headerWrap}>
            {/* Total value card */}
            <View style={styles.card}>
                <Text style={styles.hTitle}>{t('totalValue')}</Text>
                <Text style={styles.hBig}>${metrics.totalValue.toLocaleString()}</Text>
                <Text style={metrics.totalGainLoss >= 0 ? styles.hGain : styles.hLoss}>
                    {metrics.totalGainLoss >= 0 ? '+' : ''}
                    {metrics.totalGainLoss.toFixed(2)} ({metrics.gainLossPct.toFixed(2)}%)
                </Text>
            </View>

            {/* Company breakdown card */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>{t('companyBreakdownCard')}</Text>
                {pct.length > 0 ? (
                    <CompanyBreakdownChart data={pct} fontFamily="Montserrat-Medium" />
                ) : (
                    <Text style={styles.hMuted}>{t('breakdownNoData')}</Text>
                )}
            </View>

            {/* Grants section header */}
            <Text style={styles.grantsHeader}>{t('grantsHeader')}</Text>
        </View>
    );

    // empty list UI
    const EmptyList = () => (
        <View style={styles.emptyWrap}>
            <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>{t('noGrantsTitle')}</Text>
                <Text style={styles.emptyText}>
                    {t('noGrantsBody', { tab: t('addGrant') })}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView edges={['top']} style={styles.safe}>
            <FlatList
                style={styles.list}
                data={state.grants}
                keyExtractor={(g) => g.id}
                ListHeaderComponent={Header}
                ListEmptyComponent={EmptyList}
                ListFooterComponent={<View style={styles.footerSpacer} />}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                    // compute current value for card
                    const value = (state.prices[item.symbol] ?? 0) * item.shares;
                    return (
                        <GrantCard
                            grant={item}
                            value={value}
                            onPress={() => nav.navigate('GrantDetails', { id: item.id })}
                        />
                    );
                }}
            />
        </SafeAreaView>
    );
}

const makeStyles = (p: any) =>
    StyleSheet.create({
        safe: {
            flex: 1,
            backgroundColor: p.background,
        },
        list: {
            flex: 1,
        },
        headerWrap: {
            paddingTop: SPACING,
        },
        card: {
            marginHorizontal: SPACING,
            marginBottom: SPACING,
            padding: SPACING,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: p.border,
            backgroundColor: p.card,
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowOffset: { width: 0, height: 6 },
            shadowRadius: 12,
            elevation: 2,
        },
        hTitle: {
            fontFamily: 'Montserrat-Bold',
            fontSize: 16,
            color: p.text,
        },
        hBig: {
            fontFamily: 'Montserrat-Bold',
            fontSize: 28,
            color: p.text,
            marginTop: 6,
        },
        hGain: {
            fontFamily: 'Montserrat-Medium',
            color: p.up,
            marginTop: 2,
        },
        hLoss: {
            fontFamily: 'Montserrat-Medium',
            color: p.down,
            marginTop: 2,
        },
        hMuted: {
            fontFamily: 'Montserrat-Regular',
            color: p.muted,
            marginTop: 6,
        },
        sectionTitle: {
            fontFamily: 'Montserrat-Bold',
            color: p.text,
            fontSize: 18,
            marginBottom: 6,
        },
        grantsHeader: {
            marginHorizontal: SPACING,
            marginBottom: SPACING,
            fontFamily: 'Montserrat-Bold',
            color: p.text,
            fontSize: 18,
        },
        emptyWrap: {
            paddingHorizontal: SPACING,
            paddingVertical: 24,
        },
        emptyCard: {
            borderWidth: 1,
            borderRadius: 16,
            padding: SPACING,
            alignItems: 'flex-start',
            borderColor: p.border,
            backgroundColor: p.card,
        },
        emptyTitle: {
            fontFamily: 'Montserrat-Bold',
            color: p.text,
            marginBottom: 6,
            fontSize: 16,
        },
        emptyText: {
            fontFamily: 'Montserrat-Regular',
            color: p.muted,
        },
        footerSpacer: {
            height: SPACING,
        },
    });
