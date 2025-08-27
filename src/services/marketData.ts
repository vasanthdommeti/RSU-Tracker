// import { ALPHAVANTAGE_KEY } from '@env';

import { CompanySymbol, PriceMap } from "../types/types";

const DUMMY: PriceMap = {
    AAPL: 210, GOOGL: 175, AMZN: 180, NFLX: 620,
    META: 505, MSFT: 460, TSLA: 240, NVDA: 1200,
};

export async function fetchCurrentPrices(symbols: CompanySymbol[]): Promise<PriceMapceMap> {
    // TODO: replace with Alpha Vantage batch or Yahoo provider
    // Respect rate limiting, add retries, and cache timestamp
    const out: PriceMap = {};
    symbols.forEach(s => { out[s] = DUMMY[s] ?? 100; });
    await new Promise(r => setTimeout(r, 300)); // mock delay
    return out;
}
