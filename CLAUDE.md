# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start development server
npx expo start

# Run on specific platform
npx expo run:ios
npx expo run:android
npx expo start --web

# EAS builds
eas build --profile development
eas build --profile preview
eas build --profile production
```

No lint or test scripts are configured yet.

## Environment

RevenueCat API key is loaded from `.env` via `src/config/env.ts`:

```
EXPO_PUBLIC_REVENUECAT_APPLE_KEY=<key>
```

## Architecture

**One Big Thing** is a minimalist React Native/Expo productivity app (iOS-first) for setting and completing one daily goal, with streak tracking and optional premium history access via RevenueCat subscriptions.

### Provider Tree

```
App.tsx
  ThemeProvider          → system light/dark theme via useColorScheme()
  SubscriptionProvider   → RevenueCat billing, blocks render until configured
    SafeAreaProvider
    NavigationContainer
      HomeScreen          → daily task entry, weekly streak dots
      HistoryScreen       → past tasks (paywall at 7 days for free users)
```

`SubscriptionProvider` renders `null` (blocks the entire app) until RevenueCat is both configured and the initial subscription status is fetched.

### State Management

No Redux/MobX. State lives in:
- **Context** (`src/context/`) — global theme and subscription state
- **Custom hooks** (`src/hooks/`) — per-screen logic pulling from AsyncStorage and context

Key hooks:
- `useDailyTask` — today's task CRUD and completion flow; streak increments naively on complete
- `useStreak` — weekly completion tracking; **source of truth** for streak (rehydrates from task history on each load, not from the persisted streak count)
- `useTaskHistory` — filtered history (respects subscription tier)

### Subscription System

RevenueCat (`react-native-purchases`) is initialized in `SubscriptionContext` only for `Platform.OS === 'ios'`. The RevenueCat entitlement name is `premium`. The iOS API key comes from `src/config/env.ts` (read from `EXPO_PUBLIC_REVENUECAT_APPLE_KEY`).

Free tier shows only the current 7-day window (`FREE_TIER_WEEK_LIMIT = 7`). Premium unlocks full lifetime history (up to 30 days stored).

### Storage

`src/services/taskStorage.ts` is the sole AsyncStorage abstraction. All reads/writes should go through `taskStorage`. Storage keys are exported as the `STORAGE_KEYS` const. History is capped at 30 days.

`useStreak` always rehydrates weekly completion from task history (not the cached `weeklyCompletion` key) and resets at week boundaries tracked via `lastWeekStart`.

### Navigation

React Navigation native stack with two routes: `Home` (no header) and `History` (modal presentation). Defined in `src/navigation/index.tsx`.

### Dev-only features

- Reset button in `HomeScreen` (rendered only when `__DEV__`)
