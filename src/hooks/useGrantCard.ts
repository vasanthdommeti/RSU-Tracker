import { useMemo } from 'react';
import { useL10n } from '../context/LocalizationProvider';
import { useMoney } from './useFunctionality';

export function useGrantCardStrings(company: string, symbol: string, shares: number, grantPrice: number, value: number) {
    const money = useMoney();
    const { t } = useL10n();

    const title = `${company} • ${symbol}`;
    const sharesLine = `${shares} ${t('shares')}`;
    const atPrice = t('atPrice', { price: grantPrice.toFixed(2) });
    const valueText = money(value);

    return useMemo(() => ({ title, sharesLine, atPrice, valueText }), [title, sharesLine, atPrice, valueText]);
}
