# 🛣️ One Big Thing – MVP Roadmap

## 📦 PHASE 1: Project Setup & Architecture
- [x] Set up new Expo (TypeScript) app
- [x] Create folder structure from PRD (`/components`, `/screens`, etc.)
- [x] Add basic navigation (Home → History)
- [x] Add global state context (if needed)

---

## 🧠 PHASE 2: Daily Task Core Logic
- [x] Create `useDailyTask` hook (get/set today's task, check if complete)
- [x] Implement AsyncStorage wrapper in `/services/taskStorage.ts`
- [x] Build `<TaskInput />` and `<TaskCard />` components
- [x] Integrate into `HomeScreen` (input or display state)
- [x] Add animated checkbox with feedback when marking task as done

---

## 📆 PHASE 3: Streaks & History
- [x] Create `useStreak` hook (calculate from local task history)
- [ ] Show streak at top of `HomeScreen`
- [ ] Create `HistoryScreen` with scrollable task list (7-day limit)
- [ ] Add lock state for >7 days (CTA: subscribe to unlock)

---

## 🔔 PHASE 4: Notifications
- [ ] Create `useNotifications` hook
- [ ] Request permissions on first app launch
- [ ] Allow setting daily reminder time in settings (optional)
- [ ] Trigger daily reminder via local notification

---

## 💰 PHASE 5: Monetisation
- [ ] Set up RevenueCat
- [ ] Create `SubscribeModal` (benefits, £2/month)
- [ ] Lock full history + advanced stats behind paywall
- [ ] Add upgrade CTA on HistoryScreen + streak breakdown

---

## ✅ PHASE 6: Final Polish & Testing
- [ ] Add simple onboarding flow (3-screen intro modal)
- [ ] Add loading states where needed
- [ ] Test all flows end-to-end
- [ ] Deploy to Expo + prepare for TestFlight

---

## 🧪 (Optional) Post-MVP Ideas
- [ ] Cloud sync with Supabase
- [ ] Motivational quotes
- [ ] Weekly summary email
- [ ] Gamification (badges, XP, visual streak graphs)

