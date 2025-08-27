import { useCallback, useMemo } from 'react';
import { sanitizeDecimal, toNumberOrNull } from '../utils/number';
import { YearRule, VestingPlan } from '../types/types';
import { useL10n } from '../context/LocalizationProvider';

export function useVestingLabels() {
    const { t } = useL10n();
    const txt = {
        yearN: (n: number) => t('yearN', { n }),
        frequency: t('frequencyLabel'),
        perPeriod: t('percentPerPeriod'),
        percentOnce: t('percentOnce'),
        everyN: t('everyNMonths'),
        examplePerPeriod: t('examplePercentPerPeriod'),
        examplePercent: t('examplePercentOnce'),
        exampleN: t('exampleNMonths'),
        totalValid: (total: number) => t('totalValid', { total }),
        totalInvalid: (total: number) => t('totalInvalid', { total })
    };
    return txt;
}

export function useVestingRuleHelpers(plan: VestingPlan, onChange: (next: VestingPlan) => void) {
    const updateRule = useCallback(
        (year: 1 | 2 | 3 | 4, patch: Partial<YearRule>) => {
            const rules = plan.rules.map((r) => (r.year === year ? { ...r, ...patch } : r));
            onChange({ rules });
        },
        [plan.rules, onChange]
    );

    const getPctText = useCallback((rule: YearRule) => rule._pctText ?? (rule.percentage == null ? '' : String(rule.percentage)), []);
    const onPctChange = useCallback(
        (year: 1 | 2 | 3 | 4, text: string) => {
            const clean = sanitizeDecimal(text, 6);
            const n = toNumberOrNull(clean);
            updateRule(year, { percentage: n ?? undefined, _pctText: clean } as any);
        },
        [updateRule]
    );

    const onNMonthsChange = useCallback(
        (year: 1 | 2 | 3 | 4, text: string) => {
            const sNum = text.replace(/[^\d]/g, '');
            updateRule(year, { nMonths: sNum ? Math.max(1, Number(sNum)) : undefined });
        },
        [updateRule]
    );

    return { updateRule, getPctText, onPctChange, onNMonthsChange };
}
