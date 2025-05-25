# One Big Thing 🧠 ✅

A minimalist daily productivity app to help users focus on just one important task per day. Simple, focused, and consistent — because one big win beats ten half-done ones.

## ✨ MVP Features

- Set **one daily goal**
- Check it off with a satisfying animation
- View your **past daily goals**
- Track your **completion streak**
- Receive a **daily notification reminder**
- Paywall extended history & streak stats (~£2/month)

---

## 🧱 Architecture Overview

/src
│
├── /components # UI elements (Button, Checkbox, TaskCard)
├── /screens # App screens (HomeScreen, HistoryScreen)
├── /hooks # Business logic (useDailyTask, useStreak)
├── /services # Abstractions for storage, notifications, billing
├── /context # Global app state (TaskProvider, ThemeProvider)
├── /types # Shared TypeScript types
├── /utils # Helpers (dates, formatting, constants)
└── App.tsx # Entry point with navigation + providers


- **Storage**: `AsyncStorage` abstracted via `taskStorage.ts`
- **State Management**: Minimal `React.Context` + local state
- **Notifications**: Expo notifications for daily reminder
- **Subscription**: RevenueCat (to be added in v1.1)

---

## 🔄 Development Workflow

- All tasks tracked in `TODO.md`
- Issues & bugs tracked in `issues.md`
- Types defined early in `/types/`
- Use `git branch` for each feature
- All logic in hooks/services, no business logic in UI components

---

## 🧠 Psychological Hooks

- **Commitment bias**: Writing it down = higher chance of doing it
- **Loss aversion**: Don’t break the streak!
- **Clarity = motivation**: Only one task = less overwhelm

---

## ⏳ Post-MVP Roadmap (not in scope for v1)

- Cloud sync with Supabase
- “Time of day” analytics (when goals are completed)
- Motivational quotes for consistency
- Shareable streak cards
- iCloud/Google Drive backup

---

## 🧪 Testing

Coming soon: unit tests for core hooks (`useDailyTask`, `useStreak`) using `Jest` + `React Native Testing Library`.

---

## 🧰 Stack

- **React Native + Expo**
- **TypeScript**
- **AsyncStorage**
- **RevenueCat (for in-app subscriptions)**
- **Expo Notifications**

---

## 🙌 Made with love by Zain Momo
