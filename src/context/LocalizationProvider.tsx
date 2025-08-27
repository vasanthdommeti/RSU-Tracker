import React, { createContext, useContext } from 'react';
import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';

const resources = {
    en: {
        translation: {
            portfolio: 'Portfolio',
            addGrant: 'Add Grant',
            calendar: 'Calendar',
            analytics: 'Analytics',
            settings: 'Settings',
            totalValue: 'Total Value',
            gainLoss: 'Gain / Loss',
            dailyChange: 'Daily Change',
            companyBreakdown: 'Company Breakdown',
            nextVests: 'Next Vesting',
            shares: 'shares',
            vestingPlan: 'Vesting Plan',
            frequency: 'Frequency',
            percentage: 'Percentage',
            year: 'Year',
            save: 'Save',
            delete: 'Delete',
            edit: 'Edit',
            grantDetails: 'Grant Details',
            riskScore: 'Risk Score',

            // AddGrant
            addGrantTitle: 'Add Grant',
            grantDetailsCard: 'Grant Details',
            company: 'Company',
            grantDate: 'Grant Date',
            pickDate: 'Pick a date',
            grantPrice: 'Grant Price',
            saveGrant: 'Save Grant',
            vestingPlanCard: 'Vesting Plan',
            toastPlanInvalidTitle: 'Vesting plan must equal 100%',
            toastPlanInvalidBody: 'Current total: {{total}}%',
            iosDone: 'Done',
            inputSharesPlaceholder: 'e.g. 100',
            inputPricePlaceholder: 'e.g. 100.00',

            // GrantDetails
            avg: 'Avg',
            now: 'Now',
            details: 'Details',
            basis: 'Basis',
            position: 'Position',
            upcomingNext: 'Upcoming (next {{n}})',
            noUpcoming: 'No upcoming events.',
            taxEstimatorTitle: 'Tax Estimator (next {{n}} vests)',
            vestedValue: 'Vested Value',
            federalWithholdingRate: 'Federal Withholding ({{rate}}%)',
            estimatedTotalTaxRate: 'Estimated Total Tax ({{rate}}%)',
            netProceeds: 'Net Proceeds',
            holdVsSell: 'Hold vs Sell',
            hintHigh: 'Consider selling to reduce risk (High concentration)',
            hintMed: 'Partial sell could diversify (Medium concentration)',
            hintLow: 'Holding looks reasonable (Low concentration)',
            companyConcentration: 'Company concentration: {{pct}}%',
            deleteGrantCta: 'Delete Grant',
            deleteGrantTitle: 'Delete grant?',
            deleteGrantBody: 'This cannot be undone.',
            cancel: 'Cancel',
            confirmDelete: 'Delete',

            // PortfolioOverview
            companyBreakdownCard: 'Company Breakdown',
            breakdownNoData: 'No data yet — add a grant to see your breakdown.',
            grantsHeader: 'Grants',
            noGrantsTitle: 'No grants yet',
            noGrantsBody: 'Add your first grant from the {{tab}} tab.',

            // Typeahead
            typeCompanyPlaceholder: 'Type company…',
            noDataFound: 'No data found',

            // GrantCard
            atPrice: '@ ${{price}}',

            // VestingBuilder
            yearN: 'Year {{n}}',
            frequencyLabel: 'Frequency',
            percentPerPeriod: 'Percent / period',
            percentOnce: 'Percent',
            everyNMonths: 'Every N months',
            examplePercentPerPeriod: 'e.g. 2.0833',
            examplePercentOnce: 'e.g. 25',
            exampleNMonths: 'e.g. 2',
            totalValid: 'Total = {{total}}% (Valid)',
            totalInvalid: 'Total = {{total}}% (Must equal 100%)'
        }
    },
    hi: {
        translation: {
            portfolio: 'पोर्टफोलियो',
            addGrant: 'ग्रांट जोड़ें',
            calendar: 'कैलेंडर',
            analytics: 'एनालिटिक्स',
            settings: 'सेटिंग्स',
            totalValue: 'कुल मूल्य',
            gainLoss: 'लाभ / हानि',
            dailyChange: 'दैनिक बदलाव',
            companyBreakdown: 'कंपनी ब्रेकडाउन',
            nextVests: 'अगली वेस्टिंग',
            shares: 'शेयर',
            vestingPlan: 'वेस्टिंग योजना',
            frequency: 'आवृत्ति',
            percentage: 'प्रतिशत',
            year: 'वर्ष',
            save: 'सेव',
            delete: 'हटाएं',
            edit: 'संपादित',
            grantDetails: 'ग्रांट विवरण',
            riskScore: 'जोखिम स्कोर',

            // AddGrant
            addGrantTitle: 'ग्रांट जोड़ें',
            grantDetailsCard: 'ग्रांट विवरण',
            company: 'कंपनी',
            grantDate: 'ग्रांट तिथि',
            pickDate: 'तिथि चुनें',
            grantPrice: 'ग्रांट मूल्य',
            saveGrant: 'ग्रांट सेव करें',
            vestingPlanCard: 'वेस्टिंग योजना',
            toastPlanInvalidTitle: 'वेस्टिंग योजना 100% होनी चाहिए',
            toastPlanInvalidBody: 'वर्तमान कुल: {{total}}%',
            iosDone: 'हो गया',
            inputSharesPlaceholder: 'उदा. 100',
            inputPricePlaceholder: 'उदा. 100.00',

            // GrantDetails
            avg: 'औसत',
            now: 'वर्तमान',
            details: 'विवरण',
            basis: 'आधार',
            position: 'पोज़िशन',
            upcomingNext: 'आने वाले (अगले {{n}})',
            noUpcoming: 'कोई आगामी इवेंट नहीं।',
            taxEstimatorTitle: 'कर अनुमानक (अगले {{n}} वेस्ट)',
            vestedValue: 'वेस्टेड वैल्यू',
            federalWithholdingRate: 'फेडरल विदहोल्डिंग ({{rate}}%)',
            estimatedTotalTaxRate: 'कुल अनुमानित कर ({{rate}}%)',
            netProceeds: 'नेट प्राप्ति',
            holdVsSell: 'होल्ड बनाम सेल',
            hintHigh: 'जोखिम घटाने के लिए बेचने पर विचार करें (उच्च एकाग्रता)',
            hintMed: 'आंशिक बिक्री विविधता ला सकती है (मध्यम एकाग्रता)',
            hintLow: 'होल्ड करना उचित लगता है (कम एकाग्रता)',
            companyConcentration: 'कंपनी एकाग्रता: {{pct}}%',
            deleteGrantCta: 'ग्रांट हटाएं',
            deleteGrantTitle: 'ग्रांट हटाएं?',
            deleteGrantBody: 'इसे पूर्ववत नहीं किया जा सकता।',
            cancel: 'रद्द करें',
            confirmDelete: 'हटाएं',

            // PortfolioOverview
            companyBreakdownCard: 'कंपनी ब्रेकडाउन',
            breakdownNoData: 'अभी कोई डेटा नहीं — ब्रेकडाउन देखने के लिए एक ग्रांट जोड़ें।',
            grantsHeader: 'ग्रांट्स',
            noGrantsTitle: 'अभी कोई ग्रांट नहीं',
            noGrantsBody: 'अपना पहला ग्रांट {{tab}} टैब से जोड़ें।',

            // Typeahead
            typeCompanyPlaceholder: 'कंपनी टाइप करें…',
            noDataFound: 'डेटा नहीं मिला',

            // GrantCard
            atPrice: '@ ${{price}}',

            // VestingBuilder
            yearN: 'वर्ष {{n}}',
            frequencyLabel: 'आवृत्ति',
            percentPerPeriod: 'प्रतिशत / अवधि',
            percentOnce: 'प्रतिशत',
            everyNMonths: 'हर N महीने',
            examplePercentPerPeriod: 'उदा. 2.0833',
            examplePercentOnce: 'उदा. 25',
            exampleNMonths: 'उदा. 2',
            totalValid: 'कुल = {{total}}% (मान्य)',
            totalInvalid: 'कुल = {{total}}% (100% होना चाहिए)'
        }
    }
};

i18n.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
});

const L10nCtx = createContext({ t: (k: string, p?: any) => k, i18n });

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { t } = useTranslation();
    return <L10nCtx.Provider value={{ t, i18n }}>{children}</L10nCtx.Provider>;
};

export function useL10n() {
    return useContext(L10nCtx);
}
