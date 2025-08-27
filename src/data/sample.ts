import uuid from 'react-native-uuid';
import { Frequency, Grant, VestingPlan, YearRule } from '../types/types';
import { CompanyItem } from '../hooks/useTypeahead';

export const defaultPlan: VestingPlan = {
    rules: [
        { year: 1, frequency: 'annual', percentage: 25 },
        { year: 2, frequency: 'monthly', percentage: 25 },
        { year: 3, frequency: 'monthly', percentage: 25 },
        { year: 4, frequency: 'monthly', percentage: 25 },
    ]
};

export const sampleGrants: Grant[] = [
    {
        id: uuid.v4() as string,
        company: 'Apple',
        symbol: 'AAPL',
        grantDate: '2023-01-15',
        shares: 100,
        grantPrice: 150,
        vestingPlan: defaultPlan,
    },
    {
        id: uuid.v4() as string,
        company: 'Google',
        symbol: 'GOOGL',
        grantDate: '2022-06-01',
        shares: 50,
        grantPrice: 2200,
        vestingPlan: defaultPlan,
    }
];

export const ALL_COMPANIES: CompanyItem[] = [
    { label: 'Apple (AAPL)', value: 'AAPL', name: 'Apple' },
    { label: 'Google (GOOGL)', value: 'GOOGL', name: 'Google' },
    { label: 'Amazon (AMZN)', value: 'AMZN', name: 'Amazon' },
    { label: 'Netflix (NFLX)', value: 'NFLX', name: 'Netflix' },
    { label: 'Meta (META)', value: 'META', name: 'Meta' },
    { label: 'Microsoft (MSFT)', value: 'MSFT', name: 'Microsoft' },
    { label: 'Tesla (TSLA)', value: 'TSLA', name: 'Tesla' },
    { label: 'NVIDIA (NVDA)', value: 'NVDA', name: 'NVIDIA' },
];

export const createEmptyPlan = (): VestingPlan => ({
    rules: [
        { year: 1, frequency: 'annual', percentage: undefined } as unknown as YearRule,
        { year: 2, frequency: 'monthly', percentage: undefined } as unknown as YearRule,
        { year: 3, frequency: 'monthly', percentage: undefined } as unknown as YearRule,
        { year: 4, frequency: 'monthly', percentage: undefined } as unknown as YearRule,
    ],
});

export const FREQ_OPTIONS: { label: string; value: Frequency }[] = [
    { label: 'annual', value: 'annual' },
    { label: 'monthly', value: 'monthly' },
    { label: 'quarterly', value: 'quarterly' },
    { label: 'every 3 months', value: 'every_3_months' },
    { label: 'custom N months', value: 'custom_n_months' }
];
