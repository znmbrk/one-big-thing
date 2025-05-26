# 🛣️ One Big Thing – MVP Roadmap

---

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
- [x] Show streak at top of `HomeScreen`
- [x] Create `HistoryScreen` with scrollable task list (7-day limit)
- [x] Add lock state for >7 days (CTA: subscribe to unlock)

---

## 🎨 PHASE 4: UI & UX Polish (Inspired by HabitKit)
- [x] Add **7-dot streak bar** (colored/faded dots based on completion)
- [x] Restyle `<TaskCard />` to look like an iOS widget (rounded, shadow, bold task title, optional emoji)
- [x] Display a **motivational quote** under the task (rotates daily from static list)
- [x] Animate streak count when increased (bounce or pulse)
- [ ] Add **dark/light mode** styling support based on system preference
- [ ] Optional: Show "Best streak" or "This week: 5/7 complete" under the streak bar

---

## 🔔 PHASE 5: Notifications
- [ ] Create `useNotifications` hook (request permissions, set time, schedule daily reminders)
- [ ] Add "Reminder set for 9:00 AM" indicator in `HomeScreen`
- [ ] Optional: Add modal to change reminder time

---

## 💰 PHASE 6: Monetisation
- [ ] Set up RevenueCat for subscriptions
- [ ] Create `SubscribeModal` (benefits, £2/month plan)
- [ ] Lock full history and advanced streak stats behind paywall
- [ ] Add upgrade CTA on HistoryScreen and under streak bar

---

## ✅ PHASE 7: Final Polish & Deployment
- [ ] Add simple onboarding flow (3-screen intro modal)
- [ ] Add loading states and edge case handling
- [ ] Test full flow on iOS and Android (real device + simulator)
- [ ] Deploy to Expo + prepare TestFlight build

---

## 💡 Post-MVP Ideas
- [ ] Cloud sync with Supabase or Firebase
- [ ] Gamification: badges, XP, leaderboard
- [ ] Weekly summary email or push insight
- [ ] Shareable streak graphics (e.g., "7-day focus streak 🔥")
- [ ] Custom themes / color palettes

