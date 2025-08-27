import { Grant, PortfolioMetrics, PriceMap } from "../types/types";

export function computePortfolioMetrics(grants: Grant[], prices: PriceMap): PortfolioMetrics {
    let totalValue = 0;
    let totalGrantValue = 0;
    const byCompanyMap: Record<string, { value: number; shares: number }> = {};

    for (const g of grants) {
        const curr = prices[g.symbol] ?? 0;
        const val = curr * g.shares;
        const grantVal = g.grantPrice * g.shares;

        totalValue += val;
        totalGrantValue += grantVal;

        byCompanyMap[g.symbol] ??= { value: 0, shares: 0 };
        byCompanyMap[g.symbol].value += val;
        byCompanyMap[g.symbol].shares += g.shares;
    }

    const byCompany = Object.entries(byCompanyMap).map(([symbol, v]) => ({
        symbol: symbol as any,
        value: v.value,
        shares: v.shares,
    }));

    const totalGainLoss = totalValue - totalGrantValue;
    const gainLossPct = totalGrantValue === 0 ? 0 : (totalGainLoss / totalGrantValue) * 100;

    const maxConcentration = byCompany.reduce((m, c) => Math.max(m, (c.value / (totalValue || 1)) * 100), 0);
    const riskScore = Math.round(maxConcentration * 100) / 100;

    return { totalValue, totalGrantValue, totalGainLoss, gainLossPct, byCompany, riskScore };
}

// Tax helpers
export function federalWithholding(vestedValue: number) {
    return vestedValue * 0.22;
}
export function estimatedTotalTax(vestedValue: number) {
    return vestedValue * 0.35; // approx
}
export function netProceeds(vestedValue: number) {
    return vestedValue - estimatedTotalTax(vestedValue);
}
