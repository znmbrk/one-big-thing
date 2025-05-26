# 🌓 Dark Mode Implementation Tasks

## 1️⃣ Theme Setup
- [x] Create `src/types/theme.ts` with Theme interface
- [x] Create `src/theme/themes.ts` with light/dark theme objects (combined into types.ts)
- [x] Create `src/theme/ThemeContext.tsx` with provider and hook
- [x] Add ThemeProvider to App.tsx root
- [ ] Test basic theme switching with system changes

## 2️⃣ Core Components Theme Support
- [x] Update HomeScreen styles with theme values
  - [x] Background color
  - [x] Text colors
  - [x] Container styles
- [x] Modify TaskCard component
  - [x] Background color
  - [x] Text colors
  - [x] Shadow adjustments
  - [x] Checkbox colors
- [x] Update StreakBar component
  - [x] Active dot color
  - [x] Inactive dot color
  - [x] Test button styles (dev only)

## 3️⃣ Additional Screens
- [x] Add theme support to HistoryScreen
  - [x] Background color
  - [x] List item styles
  - [x] Text colors
- [x] Test navigation theming
  - [x] Header colors
  - [x] Background transitions

## 4️⃣ Testing & Polish
- [ ] Verify system theme detection
- [ ] Test theme transitions
- [ ] Check contrast ratios (WCAG AA)
- [ ] Test on both iOS and simulator
- [ ] Document theme usage for future reference

## 🐛 Known Issues
*None yet - will update as found during implementation*

## 📝 Notes
- Start with basic theme support, then add transitions
- Follow iOS system colors where possible
- Test on both light and dark system themes 