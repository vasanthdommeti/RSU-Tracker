import { Grant, PriceMap, VestEvent, YearRule } from "../types/types";

function addMonths(date: Date, n: number) { const d = new Date(date); d.setMonth(d.getMonth() + n); return d; }
function addYears(date: Date, n: number) { const d = new Date(date); d.setFullYear(d.getFullYear() + n); return d; }
function startOfMonth(date: Date) { return new Date(date.getFullYear(), date.getMonth(), 1); }

function periodsInYear(rule: YearRule) {
    switch (rule.frequency) {
        case 'annual': return 1;
        case 'monthly': return 12;
        case 'quarterly': return 4;
        case 'every_3_months': return 4;
        case 'custom_n_months': return Math.max(1, Math.floor(12 / (rule.nMonths ?? 1)));
        default: return 1;
    }
}

function splitYearIntoEvents(grantDate: Date, rule: YearRule) {
    const yearStart = addYears(grantDate, rule.year - 1);
    const count = periodsInYear(rule);
    if (rule.frequency === 'annual') {
        return [addYears(grantDate, rule.year - 1)];
    }
    const step = rule.frequency === 'quarterly' || rule.frequency === 'every_3_months'
        ? 3
        : rule.frequency === 'custom_n_months'
            ? (rule.nMonths ?? 2)
            : 1;
    const evts: Date[] = [];
    for (let m = 0; m < 12; m += step) {
        evts.push(startOfMonth(addMonths(yearStart, m)));
    }
    return evts.slice(0, count);
}

/** NEW: total = sum of per-period percentages across all periods/years */
export function validatePlanPercentTotal(rules: YearRule[]): { ok: boolean; total: number } {
    let hasMissing = false;

    const total = rules.reduce((acc, r) => {
        const periods = periodsInYear(r);
        const pct = (r.percentage ?? 0); // <- undefined treated as 0 for display
        if (r.percentage == null) hasMissing = true;
        if (r.frequency === 'custom_n_months' && (!r.nMonths || r.nMonths <= 0)) hasMissing = true;

        const add = r.frequency === 'annual' ? pct : pct * periods;
        return acc + add;
    }, 0);

    const ok = !hasMissing && Math.abs(total - 100) < 0.001;
    return { ok, total: Number.isFinite(total) ? Math.round(total * 1000) / 1000 : 0 };
}

/** Expand to events; per-period percentage becomes per-event shares directly */
export function buildVestingEvents(grant: Grant, prices: PriceMap): VestEvent[] {
    const gd = new Date(grant.grantDate);
    const evts: VestEvent[] = [];

    for (const rule of grant.vestingPlan.rules) {
        const dates = splitYearIntoEvents(gd, rule);
        const pctPerEvent = rule.frequency === 'annual'
            ? rule.percentage // one annual event carries the year’s percentage
            : rule.percentage; // each period gets this percentage

        for (const d of dates) {
            const shares = grant.shares * (pctPerEvent / 100);
            const price = prices[grant.symbol] ?? 0;
            evts.push({
                date: d.toISOString().slice(0, 10),
                symbol: grant.symbol,
                shares: Number(shares.toFixed(4)),
                valueAtCurrentPrice: Number((shares * price).toFixed(2)),
                year: rule.year,
            });
        }
    }

    evts.sort((a, b) => a.date.localeCompare(b.date));
    return evts;
}

export function nextVestingEvents(events: VestEvent[], count = 4): VestEvent[] {
    const today = new Date().toISOString().slice(0, 10);
    return events.filter(e => e.date >= today).slice(0, count);
}
