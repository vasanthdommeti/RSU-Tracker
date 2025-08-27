export type CompanySymbol =
    | 'AAPL' | 'GOOGL' | 'AMZN' | 'NFLX' | 'META' | 'MSFT' | 'TSLA' | 'NVDA';

export type Frequency = 'annual' | 'monthly' | 'quarterly' | 'every_3_months' | 'custom_n_months';

export type YearRule = {
    year: 1 | 2 | 3 | 4;
    frequency: Frequency;
    /** for annual: single value; for others: percentage total for that year (we'll split) */
    percentage: number; // 0..100 portion for that YEAR
    /** only used when frequency === 'custom_n_months' */
    nMonths?: number; // e.g., 2 -> every 2 months
};

export type VestingPlan = {
    rules: YearRule[]; // years 1..4
};

export type Grant = {
    id: string;
    company: string;  // "Apple"
    symbol: CompanySymbol; // 'AAPL'
    grantDate: string; // ISO date
    shares: number;
    grantPrice: number; // price at grant date
    vestingPlan: VestingPlan;
};

export type PriceMap = Record<CompanySymbol, number>;

export type PortfolioMetrics = {
    totalValue: number;
    totalGrantValue: number;
    totalGainLoss: number;
    gainLossPct: number;
    byCompany: { symbol: CompanySymbol; value: number; shares: number }[];
    riskScore: number; // highest concentration %
};

export type VestEvent = {
    date: string;  // ISO
    symbol: CompanySymbol;
    shares: number;
    valueAtCurrentPrice: number;
    year?: number;
};

export type GrantsState = {
    grants: Grant[];
    prices: PriceMap;
    lastPricesAt?: string;
    loadingPrices: boolean;
    error?: string;
};

export type GrantsAction =
    | { type: 'HYDRATE'; payload: Grant[] }
    | { type: 'ADD_GRANT'; payload: Grant }
    | { type: 'UPDATE_GRANT'; payload: Grant }
    | { type: 'DELETE_GRANT'; payload: { id: string } }
    | { type: 'SET_PRICES'; payload: { prices: PriceMap } }
    | { type: 'SET_LOADING_PRICES'; payload: boolean }
    | { type: 'SET_ERROR'; payload?: string };
