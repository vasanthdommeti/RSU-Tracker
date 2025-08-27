import { useMemo, useState } from 'react';
import { Platform } from 'react-native';
import uuid from 'react-native-uuid';
import Toast from 'react-native-toast-message';
import { useL10n } from '../context/LocalizationProvider';
import { useGrants } from '../context/GrantsContext';
import { CompanySymbol, Grant, VestingPlan, YearRule } from '../types/types';
import { ALL_COMPANIES, createEmptyPlan } from '../data/sample';
import { sanitizeDecimal, toNumberOrNull } from '../utils/number';
import { validatePlanPercentTotal } from '../utils/vesting';

export type CompanyItem = { label: string; value: string; name: string };

export function useAddGrantForm() {
    const { t } = useL10n();
    const { dispatch } = useGrants();

    // form state
    const [company, setCompany] = useState<CompanyItem | null>(null);
    const [resetCompanyKey, setResetCompanyKey] = useState(0);
    const [grantDate, setGrantDate] = useState<Date | null>(null);
    const [sharesText, setSharesText] = useState('');
    const [priceText, setPriceText] = useState('');
    const [plan, setPlan] = useState<VestingPlan>(createEmptyPlan());
    const [errors, setErrors] = useState<Record<string, boolean>>({});

    // date picker state
    const [showDateAndroid, setShowDateAndroid] = useState(false);
    const [showDateIOS, setShowDateIOS] = useState(false);
    const [iosTempDate, setIosTempDate] = useState<Date>(new Date());

    // derived
    const companies = useMemo(() => ALL_COMPANIES, []);

    // handlers: text fields (sanitized)
    const onChangeShares = (tVal: string) => setSharesText(sanitizeDecimal(tVal, 0));
    const onChangePrice = (tVal: string) => setPriceText(sanitizeDecimal(tVal, 6));

    // open date picker
    const openPicker = () => {
        if (Platform.OS === 'ios') {
            setIosTempDate(grantDate ?? new Date());
            setShowDateIOS(true);
        } else {
            setShowDateAndroid(true);
        }
    };

    // android date confirm
    const onAndroidChange = (_: any, date?: Date) => {
        setShowDateAndroid(false);
        if (date) setGrantDate(date);
    };

    // ios date confirm
    const onIOSConfirm = () => {
        setGrantDate(iosTempDate);
        setShowDateIOS(false);
    };

    // ios date cancel/close
    const onIOSClose = () => setShowDateIOS(false);

    // validate all fields + vesting total
    const validate = () => {
        const err: Record<string, boolean> = {};

        if (!company?.value) err.company = true;
        if (!grantDate) err.grantDate = true;

        const shares = toNumberOrNull(sanitizeDecimal(sharesText, 0));
        const price = toNumberOrNull(sanitizeDecimal(priceText, 6));
        if (!shares || shares <= 0) err.shares = true;
        if (!price || price <= 0) err.grantPrice = true;

        const { ok, total } = validatePlanPercentTotal(plan.rules as YearRule[]);
        if (!ok) {
            err.plan = true;
            Toast.show({
                type: 'error',
                text1: t('toastPlanInvalidTitle'),
                text2: t('toastPlanInvalidBody', { total: Math.round(total * 1000) / 1000 }),
            });
        }

        setErrors(err);
        return { ok: Object.keys(err).length === 0, shares: shares ?? 0, price: price ?? 0 };
    };

    // save grant + reset
    const save = () => {
        const v = validate();
        if (!v.ok) return;

        const g: Grant = {
            id: uuid.v4() as string,
            company: company!.name,
            symbol: company!.value as CompanySymbol,
            grantDate: (grantDate ?? new Date()).toISOString().slice(0, 10),
            shares: v.shares,
            grantPrice: v.price,
            vestingPlan: plan,
        };

        dispatch({ type: 'ADD_GRANT', payload: g });
        Toast.show({ type: 'success', text1: t('saveGrant') });

        setCompany(null);
        setResetCompanyKey(k => k + 1);
        setGrantDate(null);
        setSharesText('');
        setPriceText('');
        setPlan(createEmptyPlan());
        setErrors({});
    };

    return {
        // data
        companies,
        company,
        grantDate,
        sharesText,
        priceText,
        plan,
        errors,

        // ui state
        showDateAndroid,
        showDateIOS,
        iosTempDate,

        // setters
        setCompany,
        setIosTempDate,
        setPlan,

        // handlers
        onChangeShares,
        onChangePrice,
        openPicker,
        onAndroidChange,
        onIOSConfirm,
        onIOSClose,
        save,

        // misc
        resetCompanyKey,
        setResetCompanyKey,
    };
}
