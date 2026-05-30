# One Big Thing — To-Do

## 🔴 Priority 1 — App Store Blockers

### Notifications (Phase 5 — Not Started)
- [ ] Create `useNotifications` hook (request permissions, schedule daily reminder)
- [ ] Add "Reminder set for 9:00 AM" indicator to HomeScreen
- [ ] Build optional time-picker modal to change reminder time
- [ ] Test notification delivery on real device

### Onboarding Flow (Phase 7 — Not Started)
- [ ] Design 3-screen onboarding flow (what the app does, how streaks work, set first task)
- [ ] Show onboarding only on first launch (persist seen flag to AsyncStorage)
- [ ] Hook into navigation so it appears before HomeScreen on first open

### App Store Submission (Phase 7 — Partially Done)
- [ ] Set up TestFlight and run internal testing
- [ ] Create App Store screenshots (required — all device sizes)
- [ ] Write App Store description, keywords, and support URL
- [ ] Add privacy policy URL (required by Apple)
- [ ] Submit for App Store review

---

## 🟡 Priority 2 — Polish Before Launch

### History Screen Animation Polish
- [ ] Animate view mode transitions (Week ↔ Calendar / Timeline)
- [ ] Add loading skeleton or spinner while history loads
- [ ] Add haptic feedback on history cell interactions
- [ ] Refine empty state messaging and visuals

### Dark Mode Testing
- [ ] Verify WCAG AA contrast ratios on all screens in dark mode
- [ ] Test theme transition when system setting changes mid-session
- [ ] Full real-device test in both light and dark modes

### Performance Optimisation
- [ ] Lazy load large task history lists
- [ ] Optimise FlatList rendering in TaskTimeline (keyExtractor, getItemLayout)
- [ ] Add virtual scrolling for long history lists

---

## ⚪ Priority 3 — Post-MVP (Skip for Now)

- [ ] Cloud sync (Supabase or Firebase)
- [ ] Gamification (badges, XP, leaderboard)
- [ ] Data export (CSV / PDF)
- [ ] In-app analytics and insights dashboard
- [ ] Home screen widgets
- [ ] Weekly summary push notifications
