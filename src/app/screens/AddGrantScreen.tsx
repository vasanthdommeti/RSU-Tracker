import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
    Modal,
    Pressable,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import { useL10n } from '../../context/LocalizationProvider';
import CompanyTypeahead from '../../components/CompanyTypeahead';
import VestingBuilder from '../../components/VestingBuilder';
import { useAddGrantForm } from '../../hooks/useAddGrantForm';

export default function AddGrantScreen() {
    const { palette } = useTheme();
    const { t } = useL10n();
    const insets = useSafeAreaInsets();
    const s = makeStyles(palette, insets.top);

    // hook: all logic/state
    const {
        companies,
        company,
        grantDate,
        sharesText,
        priceText,
        plan,
        errors,
        showDateAndroid,
        showDateIOS,
        iosTempDate,
        setCompany,
        setIosTempDate,
        setPlan,
        onChangeShares,
        onChangePrice,
        openPicker,
        onAndroidChange,
        onIOSConfirm,
        onIOSClose,
        save,
        resetCompanyKey,
    } = useAddGrantForm();

    return (
        <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    contentContainerStyle={s.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Title */}
                    <Text style={s.h1}>{t('addGrantTitle')}</Text>

                    {/* Details card */}
                    <View style={s.card}>
                        <Text style={s.cardTitle}>{t('grantDetailsCard')}</Text>

                        {/* Company */}
                        <Text style={s.label}>{t('company')}</Text>
                        <CompanyTypeahead
                            items={companies}
                            onSelect={(it) => setCompany(it)}
                            error={!!errors.company}
                            resetKey={resetCompanyKey}
                        />

                        {/* Grant date */}
                        <Text style={s.label}>{t('grantDate')}</Text>
                        <TouchableOpacity onPress={openPicker} style={[s.inputBtn, errors.grantDate && s.errorBorder]}>
                            <Ionicons name="calendar" size={18} color={palette.muted} style={s.iconGap} />
                            <Text style={grantDate ? s.dateText : s.datePlaceholder}>
                                {grantDate ? grantDate.toISOString().slice(0, 10) : t('pickDate')}
                            </Text>
                        </TouchableOpacity>

                        {/* Android picker */}
                        {showDateAndroid && Platform.OS === 'android' && (
                            <DateTimePicker
                                value={grantDate ?? new Date()}
                                mode="date"
                                display="default"
                                onChange={onAndroidChange}
                            />
                        )}

                        {/* iOS picker sheet */}
                        {Platform.OS === 'ios' && (
                            <Modal visible={showDateIOS} transparent animationType="slide" onRequestClose={onIOSClose}>
                                <Pressable style={s.backdrop} onPress={onIOSClose} />
                                <View style={s.sheet}>
                                    <DateTimePicker
                                        value={iosTempDate}
                                        mode="date"
                                        display="spinner"
                                        onChange={(_, d) => d && setIosTempDate(d)}
                                    />
                                    <View style={s.sheetRow}>
                                        <TouchableOpacity onPress={onIOSConfirm} style={s.sheetBtn}>
                                            <Text style={s.sheetBtnTxt}>{t('iosDone')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Modal>
                        )}

                        {/* Shares */}
                        <Text style={s.label}>{t('shares')}</Text>
                        <TextInput
                            value={sharesText}
                            onChangeText={onChangeShares}
                            keyboardType={Platform.select({ ios: 'number-pad', android: 'numeric' })}
                            inputMode="numeric"
                            style={[s.input, errors.shares && s.errorBorder]}
                            placeholder={t('inputSharesPlaceholder')}
                            placeholderTextColor={palette.muted}
                        />

                        {/* Grant price */}
                        <Text style={s.label}>{t('grantPrice')}</Text>
                        <TextInput
                            value={priceText}
                            onChangeText={onChangePrice}
                            keyboardType={Platform.select({ ios: 'decimal-pad', android: 'numeric' })}
                            inputMode="decimal"
                            style={[s.input, errors.grantPrice && s.errorBorder]}
                            placeholder={t('inputPricePlaceholder')}
                            placeholderTextColor={palette.muted}
                        />
                    </View>

                    {/* Vesting plan */}
                    <View style={s.card}>
                        <Text style={s.cardTitle}>{t('vestingPlanCard')}</Text>
                        <VestingBuilder plan={plan} onChange={setPlan} error={errors.plan} />
                    </View>

                    {/* CTA */}
                    <TouchableOpacity onPress={save} style={s.save}>
                        <Text style={s.saveTxt}>{t('saveGrant')}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const makeStyles = (p: any, topInset: number) => {
    const isLight = p.background === '#FFFFFF';
    const ctaBg = isLight ? p.text : '#2563EB';
    const ctaTxt = isLight ? p.background : '#FFFFFF';

    return StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: p.background,
            paddingTop: topInset
        },
        scrollContent: {
            padding: 16,
            paddingBottom: 32
        },
        h1: {
            color: p.text,
            fontSize: 24,
            fontFamily: 'Montserrat-Bold',
            marginBottom: 12
        },
        card: {
            backgroundColor: p.card,
            borderWidth: 1,
            borderColor: p.border,
            borderRadius: 20,
            padding: 14,
            marginBottom: 14,
        },
        cardTitle: {
            color: p.text,
            fontFamily: 'Montserrat-Bold',
            fontSize: 16,
            marginBottom: 10
        },
        label: {
            fontSize: 14,
            marginBottom: 6,
            color: p.muted,
            fontFamily: 'Montserrat-Medium'
        },
        input: {
            borderWidth: 1,
            borderColor: p.border,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 12,
            marginBottom: 12,
            color: p.text,
            backgroundColor: p.card,
            fontFamily: 'Montserrat-Regular',
        },
        inputBtn: {
            borderWidth: 1,
            borderColor: p.border,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 12,
            marginBottom: 12,
            backgroundColor: p.card,
            flexDirection: 'row',
            alignItems: 'center',
        },
        iconGap: {
            marginRight: 8
        },
        dateText: {
            color: p.text,
            fontFamily: 'Montserrat-Regular'
        },
        datePlaceholder: {
            color: p.muted,
            fontFamily: 'Montserrat-Regular'
        },
        save: {
            marginTop: 8,
            padding: 14,
            alignItems: 'center',
            borderRadius: 12,
            backgroundColor: ctaBg
        },
        saveTxt: {
            color: ctaTxt,
            fontFamily: 'Montserrat-Bold'
        },
        errorBorder: {
            borderColor: '#ef4444'
        },
        backdrop: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.35)'
        },
        sheet: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            borderWidth: 1,
            borderColor: p.border,
            backgroundColor: p.card,
            paddingTop: 8,
            paddingBottom: 6,
        },
        sheetRow: {
            alignItems: 'flex-end',
            paddingHorizontal: 12,
            paddingBottom: 10
        },
        sheetBtn: {
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: '#2563EB'
        },
        sheetBtnTxt: {
            color: 'white',
            fontFamily: 'Montserrat-Bold'
        },
    });
};
