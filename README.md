# RN RSU Tracker

A lightweight, offline-first RSU/stock-grant tracker built with **React Native + Expo**, featuring a clean design, dark/light theming, localized UI (English/Hindi), typeahead company picker, flexible vesting-plan builder, portfolio analytics, and a vesting calendar.

---

## Contents

- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Environment & Tooling](#environment--tooling)
- [Libraries & Why We Use Them](#libraries--why-we-use-them)
- [Core Architecture](#core-architecture)
- [Features](#features)
- [Theming & Localization](#theming--localization)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Project Structure

```
rn-rsu-tracker/
├─ assets/
│  ├─ fonts/                 # Montserrat font family
│  ├─ logos/                 # Company logos used in cards/charts
│  └─ *.png                  # App icons / splash
├─ src/
│  ├─ app/
│  │  ├─ navigation/
│  │  │  ├─ RootNavigator.tsx
│  │  │  └─ Tabs.tsx
│  │  └─ screens/
│  │     ├─ AddGrantScreen.tsx
│  │     ├─ AnalyticsScreen.tsx
│  │     ├─ GrantDetailsScreen.tsx
│  │     ├─ PortfolioOverviewScreen.tsx
│  │     └─ VestingCalendarScreen.tsx
│  ├─ components/
│  │  ├─ CompanyBreakdownChart.tsx
│  │  ├─ CompanyTypeahead.tsx
│  │  ├─ GrantCard.tsx
│  │  ├─ PortfolioValueChart.tsx     # (optional/future)
│  │  └─ VestingBuilder.tsx
│  ├─ context/
│  │  ├─ GrantsContext.tsx           # state + persistence
│  │  ├─ LocalizationProvider.tsx    # i18next provider
│  │  └─ ThemeContext.tsx
│  ├─ data/
│  │  └─ sample.ts                    # seed companies, helpers
│  ├─ hooks/
│  │  ├─ useAddGrantForm.ts           # add-grant form state
│  │  ├─ useBreakdownChart.ts         # chart data shaping/colors
│  │  ├─ useFunctionality.ts          # logo resolver, misc.
│  │  ├─ useGrantCard.ts              # card strings/formatters
│  │  ├─ useSafeInsets.ts             # safe-area helpers
│  │  ├─ useTypeahead.ts              # typeahead core logic
│  │  ├─ useVestingBuilder.ts         # vesting editor helpers
│  │  └─ useVestingCalender.ts        # calendar sections (typo kept for compatibility)
│  ├─ services/                       # (space for API/services)
│  ├─ storage/                        # (space for storage utils)
│  ├─ types/                          # TypeScript types
│  └─ utils/                          # math/date helpers
├─ App.tsx
├─ index.ts
├─ package.json
├─ tsconfig.json
└─ app.json
```

---

## Getting Started

> Prereqs: **Node 18+**, **npm 9+** (or pnpm/yarn), and the **Expo Go** app (for device testing).

1. **Install deps**
   ```bash
   npm install
   ```

2. **Start Metro**
   ```bash
   npm run start
   ```
   - Press **i** for iOS Simulator, **a** for Android Emulator, or scan the QR with Expo Go.

3. **Run directly**
   ```bash
   npm run ios     # iOS simulator
   npm run android # Android emulator
   npm run web     # Web (limited parity)
   ```

4. **Fonts**
   - Montserrat fonts are in `assets/fonts`. They’re loaded via `expo-font` during app bootstrap.

5. **iOS pods (bare/ejected only)**
   ```bash
   npx pod-install
   ```

---

## Scripts

```json
"scripts": {
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web"
}
```

---

## Environment & Tooling

- **Expo SDK**: `~53.0.22`
- **React Native**: `0.79.6`
- **TypeScript**: `~5.8.3`

**Babel / Reanimated**

Ensure the Reanimated plugin is the last plugin in `babel.config.js`:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated'] // keep last
  };
};
```

---

## Libraries & Why We Use Them

| Package | Why |
| --- | --- |
| **@react-navigation/native**, **@react-navigation/bottom-tabs**, **@react-navigation/native-stack** | Tab + stack navigation, typed and performant. |
| **react-native-gesture-handler**, **react-native-screens**, **react-native-safe-area-context** | Required by React Navigation; native gestures, screen primitives, insets. |
| **react-native-reanimated** | Smooth animations (e.g., card entrance). |
| **react-native-svg** | Vector primitives for charts. |
| **victory / victory-native** | Pie/analytics charts on top of SVG. |
| **@shopify/react-native-skia** | High-perf drawing (optional/future visualizations). |
| **i18next / react-i18next** | Localization (English/Hindi provided). |
| **@react-native-community/datetimepicker** | Native date pickers for grant date input. |
| **react-native-element-dropdown** | Accessible, customizable dropdown for vesting frequency. |
| **react-native-toast-message** | Inline toasts for validation/UX hints. |
| **@react-native-async-storage/async-storage** | Local persistence of grants/prices. |
| **react-native-uuid** + **react-native-get-random-values** | Stable IDs across sessions. |
| **date-fns** | Date math/formatting in calendar and summaries. |
| **expo-font** | Loading Montserrat font family. |
| **react-native-dotenv** | Optional environment variable access (`.env`). |
| **@expo/vector-icons** | Ionicons for UI chrome. |

---

## Core Architecture

- **State**: `GrantsContext` keeps all grants, prices, and derived **metrics** (totals, by-company distribution). Data is cached in `AsyncStorage`.
- **Navigation**: Bottom tabs (`Portfolio`, `Add Grant`, `Calendar`, `Analytics`) + a stack screen for `GrantDetails`.
- **Hooks** (separated for testability/reuse):
  - `useTypeahead` – filtering, open/close, Android portal positioning sized to the input.
  - `useVestingBuilder` – rule updates, localized labels/placeholders, input sanitation.
  - `useBreakdownChart` – chart rows, color palettes, percentage rounding.
  - `useGrantCard` – localized strings + money formatting for list cells.
  - `useSafeInsets` – safe area helpers for headers/lists.
  - `useAddGrantForm` – add-grant field state & validation (plan must sum to 100%).
  - `useVestingCalender` – groups vesting events by month for the sectioned calendar.
- **Localization**: `LocalizationProvider` (i18next) exposes `useL10n()` → `t(key, params)`.
- **Theming**: `ThemeContext` exposes `palette` and `isDark`; components only read colors from the palette.

---

## Features

- **Portfolio Overview**
  - Total value, gain/loss, company breakdown (Victory pie).
  - Animated grant list cards.
- **Add Grant**
  - Company typeahead (Android dropdown rendered as portal with matched width).
  - Native date picker (iOS sheet / Android inline).
  - Flexible vesting plan builder (annual, monthly, quarterly, every 3 months, custom N months).
  - Validation that total vesting equals **100%**.
- **Grant Details**
  - Live value at current price, P&L, basis details.
  - Upcoming vest events (next 4), tax estimates, and diversification hints.
- **Vesting Calendar**
  - Monthly sections with totals and per-event rows (logo, shares, value).

---

## Theming & Localization

- **Theme**: The palette is provided by `ThemeContext`. It follows system theme by default (dark/light) and is consumed by all components via `useTheme()`.
- **Language**: All visible strings are in `LocalizationProvider`. Switch at runtime:
  ```ts
  import { useL10n } from './src/context/LocalizationProvider';
  const { i18n } = useL10n();
  i18n.changeLanguage('hi'); // or 'en'
  ```

---

## Troubleshooting

- **Metro cache issues**
  ```bash
  expo start -c
  ```
- **Reanimated not initialized**
  - Ensure `react-native-reanimated` plugin is in `babel.config.js` (last).
  - Rebuild if you prebuilt/ejected (run `npx pod-install` on iOS).
- **Android emulator cannot reach dev server**
  ```bash
  adb reverse tcp:8081 tcp:8081
  ```
- **Fonts not loading**
  - Confirm Montserrat files exist in `assets/fonts` and are loaded via `expo-font` during app startup.

---

## License

This project is provided as-is for educational/demo purposes. Add your preferred license file if distributing publicly.

---

## package.json (for reference)

```json
{
  "name": "rn-rsu-tracker",
  "version": "1.0.0",
  "main": "index.ts",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "@expo/vector-icons": "^14.1.0",
    "@react-native-async-storage/async-storage": "2.1.2",
    "@react-native-community/datetimepicker": "8.4.1",
    "@react-native-picker/picker": "^2.11.1",
    "@react-navigation/bottom-tabs": "^7.4.6",
    "@react-navigation/native": "^7.1.17",
    "@react-navigation/native-stack": "^7.3.25",
    "@shopify/react-native-skia": "^2.2.4",
    "date-fns": "^4.1.0",
    "expo": "~53.0.22",
    "expo-font": "^13.3.2",
    "expo-status-bar": "~2.2.3",
    "i18next": "^25.4.2",
    "react": "19.0.0",
    "react-i18next": "^15.7.2",
    "react-native": "0.79.6",
    "react-native-dotenv": "^3.4.11",
    "react-native-element-dropdown": "^2.12.4",
    "react-native-gesture-handler": "~2.24.0",
    "react-native-get-random-values": "~1.11.0",
    "react-native-reanimated": "~3.17.4",
    "react-native-safe-area-context": "5.4.0",
    "react-native-screens": "~4.11.1",
    "react-native-svg": "15.11.2",
    "react-native-toast-message": "^2.3.3",
    "react-native-uuid": "^2.0.3",
    "victory": "^36.6.11",
    "victory-native": "^36.6.11"
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@types/react": "~19.0.10",
    "@types/react-native": "^0.72.8",
    "@types/react-native-vector-icons": "^6.4.18",
    "typescript": "~5.8.3"
  },
  "private": true
}
```
