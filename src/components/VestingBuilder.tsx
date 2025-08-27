import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, Platform } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Ionicons } from '@expo/vector-icons';
import { VestingPlan } from '../types/types';
import { useTheme } from '../context/ThemeContext';
import { validatePlanPercentTotal } from '../utils/vesting';
import { useVestingLabels, useVestingRuleHelpers } from '../hooks/useVestingBuilder';
import { FREQ_OPTIONS } from '../data/sample';

export default function VestingBuilder({ plan, onChange, error }: { plan: VestingPlan; onChange: (next: VestingPlan) => void; error?: boolean }) {
    const { palette } = useTheme();
    const txt = useVestingLabels();
    const { ok, total } = useMemo(() => validatePlanPercentTotal(plan.rules), [plan.rules]);

    const isLight = palette.background === '#FFFFFF';
    const s = makeStyles(palette, !!error && !ok, isLight);

    // helpers
    const { updateRule, getPctText, onPctChange, onNMonthsChange } = useVestingRuleHelpers(plan, onChange);

    return (
        <View style={s.wrapper}>
            {plan.rules.map((rule) => {
                const isPerPeriod = rule.frequency !== 'annual';
                const pctText = getPctText(rule);

                return (
                    <View key={rule.year} style={s.card}>
                        <View style={s.headerRow}>
                            <Text style={s.yearText}>{txt.yearN(rule.year)}</Text>
                        </View>

                        <View style={s.grid}>
                            <View style={s.colFlex}>
                                <Text style={s.label}>{txt.frequency}</Text>
                                <Dropdown
                                    data={FREQ_OPTIONS}
                                    value={rule.frequency}
                                    labelField="label"
                                    valueField="value"
                                    onChange={(item: any) => updateRule(rule.year, { frequency: item.value })}
                                    style={s.dropdown}
                                    placeholderStyle={s.placeholder}
                                    selectedTextStyle={s.selected}
                                    containerStyle={s.dropdownContainer}
                                    itemTextStyle={s.itemText}
                                    maxHeight={260}
                                    dropdownPosition="bottom"
                                    showsVerticalScrollIndicator={false}
                                    activeColor="transparent"
                                    renderRightIcon={() => <Ionicons name="chevron-down" size={18} color={palette.muted} />}
                                    renderItem={(item: any) => {
                                        const active = item.value === rule.frequency;
                                        return (
                                            <View style={[s.itemRow, active && s.itemRowActive]}>
                                                <Text style={[s.itemText, active && s.itemTextActive]}>{item.label}</Text>
                                            </View>
                                        );
                                    }}
                                />
                            </View>

                            <View style={s.colSmall}>
                                <Text style={s.label}>{isPerPeriod ? txt.perPeriod : txt.percentOnce}</Text>
                                <TextInput
                                    value={pctText}
                                    onChangeText={(t) => onPctChange(rule.year, t)}
                                    keyboardType={Platform.select({ ios: 'decimal-pad', android: 'numeric' })}
                                    inputMode="decimal"
                                    style={s.input}
                                    placeholder={isPerPeriod ? txt.examplePerPeriod : txt.examplePercent}
                                    placeholderTextColor={palette.muted}
                                />
                            </View>

                            {rule.frequency === 'custom_n_months' && (
                                <View style={s.colSmall}>
                                    <Text style={s.label}>{txt.everyN}</Text>
                                    <TextInput
                                        value={String(rule.nMonths ?? '')}
                                        onChangeText={(t) => onNMonthsChange(rule.year, t)}
                                        keyboardType="number-pad"
                                        style={s.input}
                                        placeholder={txt.exampleN}
                                        placeholderTextColor={palette.muted}
                                    />
                                </View>
                            )}
                        </View>
                    </View>
                );
            })}

            <Text style={ok ? s.totalOk : s.totalBad}>{ok ? txt.totalValid(total) : txt.totalInvalid(total)}</Text>
        </View>
    );
}

const makeStyles = (p: any, redBorder: boolean, isLight: boolean) =>
    StyleSheet.create({
        wrapper: {
            gap: 14
        },
        card: {
            backgroundColor: p.card,
            borderWidth: 1,
            borderColor: redBorder ? '#ef4444' : p.border,
            borderRadius: 16,
            padding: 12,
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 1
        },
        headerRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 8
        },
        yearText: {
            color: p.text,
            fontSize: 16,
            fontFamily: 'Montserrat-Bold'
        },
        grid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12
        },
        colFlex: {
            flexGrow: 1,
            minWidth: 180,
            flexBasis: 180
        },
        colSmall: {
            flexGrow: 0,
            minWidth: 140,
            flexBasis: 140
        },
        label: {
            color: p.muted,
            marginBottom: 6,
            fontSize: 12,
            fontFamily: 'Montserrat-Medium'
        },
        input: {
            borderWidth: 1,
            borderColor: p.border,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 12,
            color: p.text,
            backgroundColor: p.card,
            fontFamily: 'Montserrat-Regular'
        },
        dropdown: {
            borderWidth: 1,
            borderColor: p.border,
            borderRadius: 12,
            paddingHorizontal: 12,
            height: 46,
            backgroundColor: p.card,
            justifyContent: 'center'
        },
        dropdownContainer: {
            borderRadius: 12,
            borderColor: p.border,
            backgroundColor: p.card
        },
        placeholder: {
            color: p.muted,
            fontFamily: 'Montserrat-Regular'
        },
        selected: {
            color: p.text,
            fontFamily: 'Montserrat-Bold'
        },
        itemRow: {
            paddingVertical: 12,
            paddingHorizontal: 12,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: p.border
        },
        itemRowActive: {
            backgroundColor: isLight ? 'rgba(37,99,235,0.12)' : 'rgba(59,130,246,0.20)'
        },
        itemText: {
            color: p.text,
            fontFamily: 'Montserrat-Regular'
        },
        itemTextActive: {
            fontFamily: 'Montserrat-Bold',
            color: p.text
        },
        totalOk: {
            fontFamily: 'Montserrat-Bold',
            marginTop: 4,
            color: p.up
        },
        totalBad: {
            fontFamily: 'Montserrat-Bold',
            marginTop: 4,
            color: p.down
        }
    });
