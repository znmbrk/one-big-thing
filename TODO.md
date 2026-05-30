# One Big Thing — To-Do

## 🔴 Priority 1 — App Store Blockers

### Smart Reminders ✅ Done
- [x] When a task is set, schedule 3 reminders: +1h, +4h, +12h after task creation time
- [x] Cap all reminders at 7pm — if a scheduled time falls after 7pm, move it to 7pm
- [x] Collapse edge case: if two reminders would land within 30 minutes of each other, drop the earlier one and keep the 7pm notification only
- [x] Cancel all pending reminders for today if the task is marked complete
- [x] Cancel and reschedule reminders if the user edits or replaces today's task
- [x] Build a settings UI (accessible from HomeScreen) to configure the reminder offsets
- [x] Default offsets (1h / 4h / 12h) and 7pm hard cap should be persisted to AsyncStorage
- [x] Request notification permissions on first task set (not on app launch)
- [x] Contextual notification titles: "1hr check-in", "4hr check-in", "End of day" — body is the goal text
- [x] Foreground notification handler set in App.tsx (was silently suppressing all notifications)
- [x] Dev test button fires all 3 reminder formats at 5s / 10s / 15s
- [ ] Test all time edge cases on real device (task set at 6am, 2pm, 7pm+)

### Task Card Redesign (Up Next)
- [ ] Simplify the goal card — remove clutter, establish clear visual hierarchy
- [ ] Decide what stays: task text (primary), completion checkbox, and one supporting element max
- [ ] Remove or relocate the daily quote from the card (it competes with the task)
- [ ] Make the card feel spacious and focused — large task text, generous padding
- [ ] Ensure the design works for both short tasks ("Email Dave") and long ones (2–3 lines)
- [ ] Fix checkbox animation peak scale (was 1.5x, now 1.12x — confirm feels right)

### View History Button Redesign
- [ ] Redesign the "View History" button on HomeScreen — current position and style feel weak
- [ ] Consider positioning it as a subtle persistent element (e.g. bottom of screen, icon + label)
- [ ] Should be accessible whether or not today's task is set or completed

### History Screen UI Fixes
- [ ] Fix blank Timeline view — currently renders nothing (bug)
- [ ] Fix "History" header sitting too close to the modal's rounded top corners — add top padding/spacing
- [ ] Allow viewing history before completing today's task (remove any gate that blocks this)

### Onboarding Flow (Phase 7 — Not Started)
- [ ] Design 3-screen onboarding flow (what the app does, how streaks work, set first task)
- [ ] Show onboarding only on first launch (persist seen flag to AsyncStorage)
- [ ] Hook into navigation so it appears before HomeScreen on first open

### App Store Submission (Phase 7 — Not Started)
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
