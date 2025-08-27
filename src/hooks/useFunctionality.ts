import { useCallback } from 'react';
import { Alert, ImageSourcePropType } from 'react-native';
import { useL10n } from '../context/LocalizationProvider';
import { useNavigation } from '@react-navigation/native';
import { useGrants } from '../context/GrantsContext';

const LOGO_MAP: Record<string, ImageSourcePropType> = {
    AAPL: require('../../assets/logos/apple.png'),
    GOOGL: require('../../assets/logos/google.png'),
    AMZN: require('../../assets/logos/amazon.png'),
    NFLX: require('../../assets/logos/netflix.png'),
    META: require('../../assets/logos/meta.png'),
    MSFT: require('../../assets/logos/microsoft.png'),
    TSLA: require('../../assets/logos/tesla.png'),
    NVDA: require('../../assets/logos/nvidia.png'),
    __DEFAULT__: require('../../assets/icon.png'),
};

export function useCompanyLogo() {
    return useCallback((symbol: string): ImageSourcePropType => {
        return LOGO_MAP[symbol] ?? LOGO_MAP.__DEFAULT__;
    }, []);
}

// currency formatter
export function useMoney() {
    return useCallback(
        (n: number) =>
            `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        []
    );
}

// localized hold/sell hint by concentration %
export function useHoldSellHint() {
    const { t } = useL10n();
    return useCallback(
        (pct: number) => (pct > 70 ? t('hintHigh') : pct > 40 ? t('hintMed') : t('hintLow')),
        [t]
    );
}

// delete grant alert + action
export function useDeleteGrantPrompt() {
    const { dispatch } = useGrants();
    const nav = useNavigation<any>();
    const { t } = useL10n();

    return useCallback(
        (id: string) => {
            Alert.alert(
                t('deleteGrantTitle'),
                t('deleteGrantBody'),
                [
                    { text: t('cancel'), style: 'cancel' },
                    {
                        text: t('confirmDelete'),
                        style: 'destructive',
                        onPress: () => {
                            dispatch({ type: 'DELETE_GRANT', payload: { id } });
                            nav.goBack();
                        },
                    },
                ],
                { cancelable: true }
            );
        },
        [dispatch, nav, t]
    );
}